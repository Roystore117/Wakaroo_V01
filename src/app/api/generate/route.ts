import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const USAGE_DELIMITER = '\x00WAKAROO_USAGE\x00';

export async function POST(req: NextRequest) {
    let body: { systemInstruction: string; headerPrompt: string; footerPrompt: string; userPrompt: string; currentHtml: string; qualitySample: string; model?: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'リクエストの解析に失敗しました' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { systemInstruction, headerPrompt, footerPrompt, userPrompt, currentHtml, qualitySample, model: requestedModel } = body;
    const modelName = requestedModel ?? 'gemini-3-flash-preview';

    let fullPrompt: string;
    if (!currentHtml) {
        const qualitySection = qualitySample?.trim()
            ? `\n\n## 【品質参考サンプル】\n⚠️ テーマ・キャラクター・教科内容は参考にしないこと。「どう作るか（How）」のコード品質・インタラクションの水準のみを参考にすること。\n\n${qualitySample.trim()}`
            : '';
        fullPrompt = `${headerPrompt}\n\n${userPrompt}\n\n${footerPrompt}${qualitySection}`;
    } else {
        fullPrompt = `このHTMLをベースに、以下の指示で修正して: ${userPrompt}\n\n${currentHtml}\n\n${footerPrompt}`;
    }

    console.log('[generate] 使用モデル:', modelName);

    const encoder = new TextEncoder();
    const isClaude = modelName.startsWith('claude-');

    const stream = new ReadableStream({
        async start(controller) {
            try {
                if (isClaude) {
                    // ── Claude (Anthropic) ──
                    const anthropicKey = process.env.ANTHROPIC_API_KEY;
                    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY が設定されていません');

                    console.log('[generate] Anthropic API 呼び出し中...');
                    const client = new Anthropic({ apiKey: anthropicKey });

                    await new Promise<void>((resolve, reject) => {
                        const messageStream = client.messages.stream({
                            model: modelName,
                            max_tokens: 32000,
                            ...(systemInstruction ? { system: systemInstruction } : {}),
                            messages: [{ role: 'user', content: fullPrompt }],
                        });

                        messageStream.on('text', (text) => {
                            controller.enqueue(encoder.encode(text));
                        });

                        messageStream.on('finalMessage', (msg) => {
                            const usage = msg.usage;
                            const usageJson = JSON.stringify({
                                promptTokens: usage.input_tokens ?? null,
                                candidatesTokens: usage.output_tokens ?? null,
                                totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
                            });
                            controller.enqueue(encoder.encode(`${USAGE_DELIMITER}${usageJson}`));
                            controller.close();
                            resolve();
                        });

                        messageStream.on('error', (err) => {
                            reject(err);
                        });
                    });
                } else {
                    // ── Gemini (Google) ──
                    const geminiKey = process.env.GEMINI_API_KEY;
                    if (!geminiKey) throw new Error('GEMINI_API_KEY が設定されていません');

                    const genAI = new GoogleGenerativeAI(geminiKey);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        ...(systemInstruction ? { systemInstruction } : {}),
                    });

                    const result = await model.generateContentStream(fullPrompt);

                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) controller.enqueue(encoder.encode(text));
                    }

                    const finalResponse = await result.response;
                    const usage = finalResponse.usageMetadata;
                    const usageJson = JSON.stringify({
                        promptTokens: usage?.promptTokenCount ?? null,
                        candidatesTokens: usage?.candidatesTokenCount ?? null,
                        totalTokens: usage?.totalTokenCount ?? null,
                    });
                    controller.enqueue(encoder.encode(`${USAGE_DELIMITER}${usageJson}`));
                    controller.close();
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error('[generate] API error:', message);
                controller.enqueue(encoder.encode(`[ERROR] ${message}`));
                controller.close();
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
