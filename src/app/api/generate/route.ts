import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY が設定されていません' }, { status: 500 });
    }

    let body: { headerPrompt: string; footerPrompt: string; userPrompt: string; currentHtml: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'リクエストの解析に失敗しました' }, { status: 400 });
    }

    const { headerPrompt, footerPrompt, userPrompt, currentHtml } = body;

    const userPart = currentHtml
        ? `このHTMLをベースに、以下の指示で修正して: ${userPrompt}\n\n${currentHtml}`
        : userPrompt;

    const fullPrompt = `${headerPrompt}\n\n${userPart}\n\n${footerPrompt}`;

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
