import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const USAGE_DELIMITER = '\x00WAKAROO_USAGE\x00';

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY が設定されていません' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: { systemInstruction: string; headerPrompt: string; footerPrompt: string; userPrompt: string; currentHtml: string; qualitySample: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'リクエストの解析に失敗しました' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { systemInstruction, headerPrompt, footerPrompt, userPrompt, currentHtml, qualitySample } = body;

    let fullPrompt: string;

    if (!currentHtml) {
        // 初回: ヘッダー＋ユーザー指示＋フッター＋品質参考サンプル
        const qualitySection = qualitySample?.trim()
            ? `\n\n## 【品質参考サンプル】\n⚠️ テーマ・キャラクター・教科内容は参考にしないこと。「どう作るか（How）」のコード品質・インタラクションの水準のみを参考にすること。\n\n${qualitySample.trim()}`
            : '';
        fullPrompt = `${headerPrompt}\n\n${userPrompt}\n\n${footerPrompt}${qualitySection}`;
    } else {
        // 2回目以降: 修正指示＋currentHTML＋フッター（ヘッダー・品質サンプル省略）
        fullPrompt = `このHTMLをベースに、以下の指示で修正して: ${userPrompt}\n\n${currentHtml}\n\n${footerPrompt}`;
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: 'gemini-3-flash-preview',
                    ...(systemInstruction ? { systemInstruction } : {}),
                });

                const result = await model.generateContentStream(fullPrompt);

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }

                // ストリーム完了後にトークン使用量を取得して末尾に付加
                const finalResponse = await result.response;
                const usage = finalResponse.usageMetadata;
                const usageJson = JSON.stringify({
                    promptTokens: usage?.promptTokenCount ?? null,
                    candidatesTokens: usage?.candidatesTokenCount ?? null,
                    totalTokens: usage?.totalTokenCount ?? null,
                });
                controller.enqueue(encoder.encode(`${USAGE_DELIMITER}${usageJson}`));
                controller.close();
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error('Gemini API error:', message);
                controller.error(err);
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Accel-Buffering': 'no',
            'Cache-Control': 'no-cache',
        },
    });
}
