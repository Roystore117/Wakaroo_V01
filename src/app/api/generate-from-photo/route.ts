import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const USAGE_DELIMITER = '\x00WAKAROO_USAGE\x00';

const SYSTEM_INSTRUCTION = `あなたは小学生向けの教育用アプリケーションを専門とする、優秀なUI/UXデザイナー兼フロントエンド開発者です。
ユーザーから提供された漢字テストの画像から正確にテキストデータを抽出し、小学生が夢中になって学習できるRPG風のインタラクティブなWebアプリを作成してください。

## 【出力フォーマット厳守】
- 出力は必ず「生のHTMLコード」のみとする。
- Markdownのコードブロック（\`\`\`html ... \`\`\`）は絶対に使用しない。
- 説明文・前置き・コメントアウト・補足は一切出力しない。
- 最初の文字は必ず \`<!DOCTYPE html>\` で始めること。
- 縦横のスクロールは完全禁止（\`overflow: hidden\`, \`height: 100vh\`）。
- 画面上部にはiframeの閉じるボタン回避用として \`60px\` のセーフティエリアを確保し、全要素を1画面内に美しく収めること。


## 【重要】完全なSVG化（脱・絵文字）:
安易な絵文字（Emoji）の使用はOSによる表示差異を生むため一切禁止。指定された世界観に合うアイコンやキャラクターは全て「インラインSVG」で描画し、待機中も \`floating\` や \`poyon\` などのCSSアニメーションで「生きたUI」にすること。


## 【システム・キッズ向けUI/UX要件】
* **技術スタックとイベント**:
HTML/CSS/Vanilla JS。Tailwind CSS、FontAwesome、\`canvas-confetti\`をCDNで使用。スマホ特化のため、\`touchstart\`, \`touchmove\`, \`touchend\` などのタッチイベントに完全対応させること。
* **タップ領域と手触り**:
全ての操作要素は子供の指で触りやすい特大サイズ（最低64px以上）とする。触ると「ぽよん」と弾むCSSアニメーションを実装する。`;


export async function POST(req: NextRequest) {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let body: { photoBase64: string; mimeType: string; prompt: string; systemInstruction?: string; headerPrompt?: string; footerPrompt?: string; qualitySample?: string; model?: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'リクエストの解析に失敗しました' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { photoBase64, mimeType, prompt, model: requestedModel, systemInstruction: requestedSystem, headerPrompt, footerPrompt, qualitySample } = body;
    const modelName = requestedModel ?? 'claude-sonnet-4-6';
    const systemInst = requestedSystem ?? SYSTEM_INSTRUCTION;
    const isClaude = modelName.startsWith('claude-');

    const userAddition = prompt?.trim() ? `\n\n## 【追加指示】\n${prompt.trim()}` : '';
    const qualitySection = qualitySample?.trim() ? `\n\n## 【品質参考サンプル】\n${qualitySample.trim()}` : '';
    const header = headerPrompt?.trim() ? `${headerPrompt.trim()}\n\n` : '';
    const footer = footerPrompt?.trim() ? `\n\n${footerPrompt.trim()}` : '';
    const fullPrompt = `${header}${userAddition}${footer}${qualitySection}`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                console.log('[generate-from-photo] 開始 model=', modelName, 'mimeType=', mimeType, 'base64len=', photoBase64.length);

                if (isClaude) {
                    const client = new Anthropic({ apiKey: anthropicKey });

                    await new Promise<void>((resolve, reject) => {
                        const messageStream = client.messages.stream({
                            model: modelName,
                            max_tokens: 64000,
                            system: systemInst,
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            type: 'image',
                                            source: {
                                                type: 'base64',
                                                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
                                                data: photoBase64,
                                            },
                                        },
                                        { type: 'text', text: fullPrompt },
                                    ],
                                },
                            ],
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

                        messageStream.on('error', (err) => reject(err));
                    });
                } else {
                    // Gemini（画像対応モデル）
                    const geminiKey = process.env.GEMINI_API_KEY;
                    if (!geminiKey) throw new Error('GEMINI_API_KEY が設定されていません');

                    const genAI = new GoogleGenerativeAI(geminiKey);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction: systemInst,
                    });

                    const result = await model.generateContentStream([
                        {
                            inlineData: {
                                data: photoBase64,
                                mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
                            },
                        },
                        { text: fullPrompt },
                    ]);

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
                console.error('[generate-from-photo] API error:', message);
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
