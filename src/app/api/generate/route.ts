import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const HIDDEN_RULE = `
【絶対ルール】出力はTailwind CSS (CDN) と Vanilla JS を含む1ファイルで完結するHTMLコードのみとし、マークダウン（\`\`\`html など）や挨拶などのテキストは絶対に含めないでください。`;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY が設定されていません' }, { status: 500 });
    }

    let body: { basePrompt: string; userPrompt: string; currentHtml: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'リクエストの解析に失敗しました' }, { status: 400 });
    }

    const { basePrompt, userPrompt, currentHtml } = body;

    // ベースプロンプト + 隠しルール
    const systemPrompt = basePrompt + HIDDEN_RULE;

    // ユーザー向けプロンプト構築（ブラッシュアップ or 新規生成）
    const userPart = currentHtml
        ? `このHTMLをベースに、以下の指示で修正して: ${userPrompt}\n\n${currentHtml}`
        : userPrompt;

    const fullPrompt = `${systemPrompt}\n\n${userPart}`;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();
        const usage = result.response.usageMetadata;

        return NextResponse.json({
            html: text,
            usage: {
                promptTokens: usage?.promptTokenCount ?? null,
                candidatesTokens: usage?.candidatesTokenCount ?? null,
                totalTokens: usage?.totalTokenCount ?? null,
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Gemini API error:', message);
        return NextResponse.json({ error: `Gemini APIエラー: ${message}` }, { status: 500 });
    }
}
