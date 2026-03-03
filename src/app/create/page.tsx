'use client';

import { useState } from 'react';
import { Send, Loader2, ChevronLeft, Upload, Wifi, Battery, Signal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PostAppModal from '@/components/PostAppModal';

const DEFAULT_HEADER_PROMPT = `あなたは、キッズ向けの「インタラクティブ・トイ（物理パズル）」に特化したAIエンジニアであり、同時に「教育カリキュラムの専門家」です。
退屈な「テキストを読んでボタンを押すだけのクイズ（Webフォーム）」は絶対に作らないでください。
以下の【絶対遵守のプロトコル】に従い、1つのHTMLファイル（CSS/JS内包）として、スマホの指での操作に特化した「触って遊べる知育おもちゃ」を開発してください。
▼テーマは下記です`;

const DEFAULT_FOOTER_PROMPT = `## 【学習設計要件：指導要領の「段階的」おもちゃ化】
* **スモールステップ設計**: 提示された「学習指導要領の項目」をそのまま丸投げするのではなく、子供が無理なく概念を理解できるように、**AI自身で「段階的（ステップバイステップ）」な学習プロセスを構成**してください。
* **難易度のグラデーション**: 最初は簡単な操作や発見（例：概念に気づく）から始まり、徐々に実践的な操作（例：実際に動かして解く、応用する）へと、アプリ内で難易度やシーンが自然に遷移するギミックを実装してください。

## 【コアUX：触って学ぶ「動的インタラクション」】（最重要要件）
本アプリは、画面上のオブジェクトを指で直接操作して概念を体感する「おもちゃ」です。以下の要件を必ず満たしてください。
* **直接操作（Direct Manipulation）**: 対象物を指でドラッグ＆ドロップ（引っ張る、運ぶ、重ねる）したり、スワイプ操作で状態を変化させる物理的な手触りを実装すること。
* **リアルタイム・フィードバック**: 操作に合わせて画面上の状態がリアルタイムに変化し、正解の配置に近づいた瞬間に「ピタッ！」と磁石のように吸着（Snap）するなどの気持ちいい反応（JavaScriptでの当たり判定）を実装すること。
* **【重要】テキスト禁止令**: 概念の説明テキストは1画面につき「最大1行（20文字以内）」まで。文字での説明を放棄し、「図解」と「ユーザー自身の操作による気づき」だけで直感的に理解させること。
* **【重要】脱・絵文字**: 安易な絵文字（Emoji）の使用は禁止。指定された世界観に合う、温かみのある手書き風のSVGベクターイラストやCSS図形を用いてリッチに表現すること。

## 【システム要件】
* **スマホ特化**: 横スクロール防止（\`overflow-x: hidden\`）、画面収まり（\`100vh\`基準）、スクロールなしの1画面完結（SPA）。
* **技術スタック**: HTML/CSS/Vanilla JS。Tailwind CSS（デザイン）、FontAwesome（アイコン）、canvas-confetti（紙吹雪演出）をCDNで使用。
* **イベントハンドリング**: スマホでの確実な操作のため、\`touchstart\`, \`touchmove\`, \`touchend\` などのタッチイベントに完全対応させること。

## 【キッズ向けUI/UX要件】
* **タップ領域と手触り**: 全ての操作要素は子供の指で触りやすい特大サイズ（最低64px以上）とする。触ると「ぽよん」と弾むCSSアニメーションを実装する。
* **ポジティブな世界観**: 難しい漢字には \`<ruby>\` でふりがなを振る。不正解時に赤色や「ブブー」という表現は使わず、正解に導くための視覚的なヒントを出す。
* **最高のご褒美**: ギミックをクリアした際は、画面いっぱいにド派手な紙吹雪（confetti）を降らせ、強力なドーパミン体験を演出する。`;

export default function CreatePage() {
    const router = useRouter();
    const [currentHtml, setCurrentHtml] = useState<string>('');
    const [headerPrompt, setHeaderPrompt] = useState<string>(DEFAULT_HEADER_PROMPT);
    const [footerPrompt, setFooterPrompt] = useState<string>(DEFAULT_FOOTER_PROMPT);
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number | null; candidatesTokens: number | null; totalTokens: number | null } | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const handleSubmit = async () => {
        if (!userPrompt.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ headerPrompt, footerPrompt, userPrompt, currentHtml }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? '不明なエラーが発生しました');
                return;
            }

            setCurrentHtml(data.html);
            setTokenUsage(data.usage ?? null);
        } catch {
            setError('通信エラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <PostAppModal
            isOpen={isPostModalOpen}
            onClose={() => setIsPostModalOpen(false)}
            initialHtmlCode={currentHtml}
        />
        <div className="flex flex-col h-[100dvh] bg-gray-200">
            {/* ── ヘッダー ── */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-1 text-gray-500 active:text-gray-800 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">トップ</span>
                </button>
                <button
                    disabled={!currentHtml}
                    onClick={() => setIsPostModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold shadow active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Upload className="w-4 h-4" />
                    投稿する
                </button>
            </div>

            {/* ── 上半分: スマホモックアッププレビュー ── */}
            <div
                className="flex-1 min-h-0 flex items-center justify-center relative py-4 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/bg-main.png')" }}
            >
                {/* スマホモックアップ */}
                <div className="h-[90%] max-h-full aspect-[9/16] bg-black border-[12px] border-black rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
                    {/* ステータスバー */}
                    <div className="absolute top-0 left-0 right-0 h-5 bg-white z-10 flex items-center px-3">
                        {/* 時刻 */}
                        <span className="text-[10px] font-bold text-black">12:34</span>
                        {/* ノッチ（中央） */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-5 bg-black rounded-b-2xl flex items-center justify-center">
                            <div className="w-8 h-1.5 bg-gray-700 rounded-full" />
                        </div>
                        {/* ステータスアイコン */}
                        <div className="ml-auto flex items-center gap-1">
                            <Signal className="w-3 h-3 text-black" />
                            <Wifi className="w-3 h-3 text-black" />
                            <Battery className="w-3.5 h-3.5 text-black" />
                        </div>
                    </div>
                    {/* コンテンツ（ノッチ分だけ上部にパディング） */}
                    <div className="flex-1 min-h-0 mt-5 relative overflow-hidden">
                        {currentHtml ? (
                            <iframe
                                srcDoc={currentHtml}
                                sandbox="allow-scripts"
                                className="w-full h-full border-0 overflow-y-auto"
                                title="生成プレビュー"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500 text-xs px-4 text-center leading-relaxed">
                                {isLoading
                                    ? 'AIがアプリを生成中...'
                                    : 'プロンプトを入力して\n「送信」を押すと\nここにアプリが表示されます'}
                            </div>
                        )}
                    </div>
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                <p className="text-xs text-gray-300 font-medium">生成中...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 下半分: 操作パネル ── */}
            <div className="flex flex-col gap-2 px-4 pt-3 pb-4 bg-gray-50 border-t border-gray-200 shrink-0">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 shrink-0">
                        {error}
                    </div>
                )}

                {/* ベースプロンプト1（ヘッダー） */}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        ベースプロンプト1（ヘッダー）
                    </label>
                    <textarea
                        value={headerPrompt}
                        onChange={(e) => setHeaderPrompt(e.target.value)}
                        rows={2}
                        className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                {/* ベースプロンプト2（フッター） */}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        ベースプロンプト2（フッター）
                    </label>
                    <textarea
                        value={footerPrompt}
                        onChange={(e) => setFooterPrompt(e.target.value)}
                        rows={2}
                        className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                {/* ユーザー入力 */}
                <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={2}
                    placeholder="例: 足し算の練習ゲームを作って。カラフルで楽しい雰囲気で。"
                    className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300 shrink-0"
                />

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !userPrompt.trim()}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    {isLoading ? '生成中...' : '送信'}
                </button>

                {/* トークン使用量デバッグ表示 */}
                {tokenUsage && (
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-600">[DEBUG] トークン使用量</span>
                            <div className="flex gap-3">
                                <span>入力: <b className="text-gray-700">{tokenUsage.promptTokens?.toLocaleString() ?? '-'}</b></span>
                                <span>出力: <b className="text-gray-700">{tokenUsage.candidatesTokens?.toLocaleString() ?? '-'}</b></span>
                                <span>合計: <b className="text-gray-700">{tokenUsage.totalTokens?.toLocaleString() ?? '-'}</b></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
