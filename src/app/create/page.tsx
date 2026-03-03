'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const DEFAULT_BASE_PROMPT = `System Prompt: Universal Educational Logic Engine (v4.0)

1. Role and Core Objective
あなたは学習者の認知発達を最適化する「教育デザイナー」です。単に問題を出すのではなく、**「進歩が目に見える喜び（Visual Progression）」**をUI/UXの核に据え、学習者を最終ゴールまで強力に牽引するプログラムを生成してください。

2. Technical Specifications
Structure: HTML / CSS / JS を完全に1つのファイルに集約。
Viewport: 100vh 基準、スクロール不要の1画面構成。
Input: touchstart 等のタッチイベントへの完全最適化。
Assets: Tailwind CSS および FontAwesome を使用。

3. Educational Protocol: Visualized 4-Stage State Machine
各レベルで3回正解することで次のステージへ移行します。以下の視覚的変化を伴う状態管理を実装してください。
Level 1 (Intro/Blue): タップ等の最小操作。UIのテーマカラーを青系に。
Level 2 (Guided/Yellow): マグネット吸着付きドラッグ。テーマカラーを黄・オレンジ系に。
Level 3 (Mastery/Red): アシストなしの精密操作。テーマカラーを情熱的な赤・ピンク系に。
Goal State (Final Gold): 全クリ画面。テーマカラーを豪華なゴールドに。

4. Interaction and Progression UI
Dynamic Progress Bar: 画面上部に、現在のレベル内での進捗を示すプログレスバー（または3つの空の星枠）を配置。正解するたびに星が光りながら飛び込む（Pop & Fly）アニメーションを伴って埋まること。
Level-Up Interstitial: レベルが上がる瞬間、画面中央に「LEVEL UP!」という巨大な文字と紙吹雪を1.5秒間表示し、背景色を次のレベルの色へドラマチックに変化させること。
Universal Snapping: 全ての変位において Math.round() 等を用いた吸着を実装。
Immediate Feedback:
  正解時: 溜まっている星が大きくバウンドし、キラキラしたエフェクトを出す。
  不正解時: 画面または対象物が「プルプル」と震え（Shake）、ヒントとなる要素を点滅させる。

5. Mathematical Robustness
Cyclic Continuity: 循環変数は法演算（Modulo）でループさせ、限界値での停止を排除する。
Relational Synchronization: 複数変数の連動における表示矛盾を完全に排除する。
Auto-Recovery: 要素の画面外逸脱を検知し、即座に有効範囲内へ復帰させる。

6. Output Format
挨拶、解説、コードブロック記号は一切不要。ブラウザで直接実行可能な HTMLソースコードのみ を出力すること。`;

export default function CreatePage() {
    const [currentHtml, setCurrentHtml] = useState<string>('');
    const [basePrompt, setBasePrompt] = useState<string>(DEFAULT_BASE_PROMPT);
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number | null; candidatesTokens: number | null; totalTokens: number | null } | null>(null);

    const handleSubmit = async () => {
        if (!userPrompt.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ basePrompt, userPrompt, currentHtml }),
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
        <div className="flex flex-col h-[100dvh] bg-gray-200">
            {/* ── 上半分: スマホモックアッププレビュー ── */}
            <div className="flex-1 min-h-0 flex items-center justify-center relative py-4">
                {/* スマホモックアップ */}
                <div className="h-[90%] max-h-full aspect-[9/16] bg-black border-8 border-black rounded-3xl shadow-2xl overflow-hidden relative">
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

            {/* ── 下半分: 操作パネル（固定高） ── */}
            <div className="h-[300px] flex flex-col gap-2 px-4 pt-3 pb-4 bg-gray-50 border-t border-gray-200 shrink-0 overflow-y-auto">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 shrink-0">
                        {error}
                    </div>
                )}

                {/* ベースプロンプト */}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        ベースプロンプト
                    </label>
                    <textarea
                        value={basePrompt}
                        onChange={(e) => setBasePrompt(e.target.value)}
                        rows={3}
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
                        <span className="font-bold text-gray-600">[DEBUG] トークン使用量</span><br />
                        入力: {tokenUsage.promptTokens?.toLocaleString() ?? '-'} tokens<br />
                        出力: {tokenUsage.candidatesTokens?.toLocaleString() ?? '-'} tokens<br />
                        合計: {tokenUsage.totalTokens?.toLocaleString() ?? '-'} tokens
                    </div>
                )}
            </div>
        </div>
    );
}
