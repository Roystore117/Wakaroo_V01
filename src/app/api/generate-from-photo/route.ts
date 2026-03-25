import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const USAGE_DELIMITER = '\x00WAKAROO_USAGE\x00';

const SYSTEM_INSTRUCTION = `あなたは、小学生・中学生向けの「インタラクティブ学習アプリ」に特化したAIエンジニアです。
添付された教材プリントの画像を正確に読み取り、その内容をベースにした学習アプリを1つのHTMLファイル（CSS/JS内包）として開発してください。

## 【出力フォーマット厳守】
- 出力は必ず「生のHTMLコード」のみとする。
- Markdownのコードブロック（\`\`\`html ... \`\`\`）は絶対に使用しない。
- 説明文・前置き・コメントアウト・補足は一切出力しない。
- 最初の文字は必ず \`<!DOCTYPE html>\` で始めること。
- 縦横のスクロールは完全禁止（\`overflow: hidden\`, \`height: 100vh\`）。
- 画面上部に \`60px\` のセーフティエリアを確保し、全要素を1画面内に収めること。

## 【デザイン要件】
- Google Fonts の \`Mochiy Pop P One\` をタイトルに使用すること。
- ボタンやカードには太いボーダー（\`border: 3px solid #1a1a1a\`）とソリッドシャドウ（\`box-shadow: 0 4px 0 #1a1a1a\`）を適用すること。
- スマホのタッチ操作に特化し、タップ領域は最低48px以上にすること。
- 正解時は canvas-confetti（CDN）で紙吹雪を演出すること。

## 【技術要件】
- HTML/CSS/Vanilla JS のみ使用。
- タッチイベント（touchstart, touchend）に対応すること。
- 問題は全てプリントから抽出した実際の問題・内容を使用すること。`;

const REPEAT_PROMPT = `## 【反復練習モード】
プリントから問題・用語・計算式などを抽出し、「反復練習アプリ」を作成してください。

### 要件
- 問題を1問ずつ表示し、タップで答え合わせができる形式にすること。
- 正解・不正解をわかりやすく表示し、不正解の場合は正答を表示すること。
- 全問終了後にスコア（正解数/総問題数）を表示すること。
- 「もう一度」ボタンで最初からやり直せること。
- 問題の順番はランダムに並び替えること。`;

const MOCK_PROMPT = `## 【模擬テストモード】
プリントから問題・内容を抽出し、「本番さながらの模擬テストアプリ」を作成してください。

### 要件
- 画面上部にカウントダウンタイマー（問題数×30秒）を表示すること。
- 問題を1問ずつ表示し、選択肢または入力で回答する形式にすること。
- 回答中は正誤を表示せず、最後に一括で採点すること。
- 終了後に点数（100点満点換算）と正解一覧を表示すること。
- 時間切れの場合は自動的に採点画面へ移行すること。`;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY が設定されていません' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: { photoBase64: string; mimeType: string; studyMode: 'repeat' | 'mock'; prompt: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'リクエストの解析に失敗しました' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { photoBase64, mimeType, studyMode, prompt } = body;

    const modePrompt = studyMode === 'mock' ? MOCK_PROMPT : REPEAT_PROMPT;
    const userAddition = prompt?.trim() ? `\n\n## 【追加指示】\n${prompt.trim()}` : '';
    const fullPrompt = `${modePrompt}${userAddition}`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                console.log('[generate-from-photo] 開始 model=gemini-1.5-flash mimeType=', mimeType, 'base64len=', photoBase64.length);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: 'gemini-1.5-flash',
                    systemInstruction: SYSTEM_INSTRUCTION,
                });

                console.log('[generate-from-photo] generateContentStream 呼び出し中...');
                const result = await model.generateContentStream([
                    {
                        inlineData: {
                            data: photoBase64,
                            mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
                        },
                    },
                    { text: fullPrompt },
                ]);
                console.log('[generate-from-photo] ストリーム開始');

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
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
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error('Gemini API error:', message);
                // エラー内容をストリームに流してクライアントで表示できるようにする
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
