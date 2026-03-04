'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, ChevronLeft, Upload, Wifi, Battery, Signal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PostAppModal from '@/components/PostAppModal';

const USAGE_DELIMITER = '\x00WAKAROO_USAGE\x00';

function extractHtml(text: string): string {
    const fenced = text.match(/```html\s*([\s\S]*?)```/);
    if (fenced) return fenced[1].trim();
    const doctypeIdx = text.indexOf('<!DOCTYPE html>');
    if (doctypeIdx !== -1) return text.slice(doctypeIdx).trim();
    const htmlIdx = text.indexOf('<html');
    if (htmlIdx !== -1) return text.slice(htmlIdx).trim();
    return text.trim();
}

function TerminalView({ text }: { text: string }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }, [text]);

    return (
        <div className="w-full h-full bg-black overflow-y-auto p-2 font-mono">
            <div className="flex items-center gap-1.5 mb-2 sticky top-0 bg-black py-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-500 text-[9px] ml-1">AI Generator</span>
            </div>
            <pre className="text-green-400 text-[9px] leading-relaxed whitespace-pre-wrap break-all">
                {text}
                <span className="animate-pulse text-green-300">▌</span>
            </pre>
            <div ref={bottomRef} />
        </div>
    );
}

const DEFAULT_SYSTEM_INSTRUCTION = `あなたは、キッズ向けの「インタラクティブ・トイ（物理パズル）」に特化したAIエンジニアであり、同時に「教育カリキュラムの専門家」です。
退屈な「テキストを読んでボタンを押すだけのクイズ（Webフォーム）」は絶対に作らないでください。
以下の【絶対遵守のプロトコル】に従い、1つのHTMLファイル（CSS/JS内包）として、スマホの指での操作に特化した「触って遊べる知育おもちゃ」を開発してください。

## 【出力フォーマット厳守】
- 出力は必ず「生のHTMLコード」のみとする。
- Markdownのコードブロック（\`\`\`html ... \`\`\`）は絶対に使用しない。
- 説明文・前置き・コメントアウト・補足は一切出力しない。
- 最初の文字は必ず \`<!DOCTYPE html>\` で始めること。
- 縦横のスクロールは完全禁止（\`overflow: hidden\`, \`height: 100vh\`）。
- 画面上部にはiframeの閉じるボタン回避用として \`60px\` のセーフティエリアを確保し、全要素を1画面内に美しく収めること。

## 【Wakaroo Design Identity：ポップ・ブルータリズム】:
単なるWebページではなく、人気ゲームのような「さわりたくなる教育ゲーム感」を以下のCSSルールで完全再現すること。
* **タイポグラフィ**: タイトルや主要ボタンのフォントには、必ずGoogle Fontsの \`Mochiy Pop P One\` を読み込んで使用し、極太でポップな印象を与えること。
* **おもちゃの物質感**: ボタンやカード等のUI要素には、淡い影ではなく「極太のボーダー（例: \`border: 3px solid #1a1a1a\`）」と「ぼかさないソリッドな影（例: \`box-shadow: 0 6px 0 #1a1a1a\`）」を適用し、物理的なブロックのような手触りを表現すること。

## 【重要】完全なSVG化（脱・絵文字）:
安易な絵文字（Emoji）の使用はOSによる表示差異を生むため一切禁止。指定された世界観に合うアイコンやキャラクターは全て「インラインSVG」で描画し、待機中も \`floating\` や \`poyon\` などのCSSアニメーションで「生きたUI」にすること。

## 【重要】テキスト禁止令
概念の説明テキストは1画面につき「最大1行（20文字以内）」まで。文字での説明を放棄し、「図解」と「ユーザー自身の操作による気づき」だけで直感的に理解させること。

## 【システム・キッズ向けUI/UX要件】
* **技術スタックとイベント**:
HTML/CSS/Vanilla JS。Tailwind CSS、FontAwesome、\`canvas-confetti\`をCDNで使用。スマホ特化のため、\`touchstart\`, \`touchmove\`, \`touchend\` などのタッチイベントに完全対応させること。
* **タップ領域と手触り**:
全ての操作要素は子供の指で触りやすい特大サイズ（最低64px以上）とする。触ると「ぽよん」と弾むCSSアニメーションを実装する。
* **ポジティブな世界観**:
難しい漢字には \`<ruby>\` でふりがなを振る。不正解時に赤色や「ブブー」という表現は使わず、正解に導くための視覚的なヒントを出す。
* **最高のご褒美**:
ギミックをクリアした際は、画面いっぱいにド派手な紙吹雪（confetti）を降らせる。また、Top画面に戻った際は該当ステージボタンに「クリア！✨」バッジを表示させ、強力なドーパミン体験を演出する。`;

const DEFAULT_HEADER_PROMPT = `【ミッション：最高峰の知育アプリ開発】
あなたは今から、専用の「教育用タブレット端末」に搭載される、最高品質の知育アプリ（1単元分）を開発します。
デザイン・レイアウト・システム制約については【SYSTEM INSTRUCTION】の絶対ルールに従い、完璧なガワ（フォーマット）を出力してください。
その上で、あなたのAIとしての創造力と教育の専門知識のすべてを、**『子供がさわって遊びながら、いつの間にか本質的な理解に到達する【知育ロジックの考案】』**に注ぎ込んでください。
圧倒的なクオリティを期待しています。

▼今回の開発テーマ（単元）`;

const DEFAULT_FOOTER_PROMPT = `## 【学習設計要件：指導要領の「段階的」教育アプリ化】
* **スモールステップ設計**:
提示された「学習指導要領の項目」をそのまま丸投げするのではなく、子供が無理なく概念を理解できるように、**AI自身で「段階的（ステップバイステップ）」な学習プロセスを構成**してください。
* **難易度のグラデーション**:
最初は簡単な操作や発見（例：概念に気づく）から始まり、徐々に実践的な操作（例：実際に動かして解く、応用する）へと、アプリ内で難易度やシーンが自然に遷移するギミックを実装してください。

## 【アプリ構造・レイアウト要件】
* **画面構成とState管理**:
アプリは必ず「Top画面」「導入画面（予想）」「プレイ画面（実験＆納得）」「全クリア画面」を持つSPAとして実装すること。
* **3-Stage Framework**:
Top画面には必ず3つのステージボタンを縦に配置すること。ただし、今回実装しプレイ可能にするのは「ステージ1」のみ。「ステージ2」「ステージ3」は『※開発中』バッジを付け、グレーアウトしてクリック不可（ロック状態）にすること。

## 【コアUX：触って学ぶ「動的インタラクション」】（最重要要件）
本アプリは、画面上のオブジェクトを指で直接操作して概念を体感する「教育アプリ」です。以下の要件を教育アプリとして効果が出る場合は積極的に採用してください。
* **直接操作（Direct Manipulation）**:
対象物を指でドラッグ＆ドロップ（引っ張る、運ぶ、重ねる）したり、スワイプ操作で状態を変化させる物理的な手触りを実装すること。
* **リアルタイム・フィードバック**:
操作に合わせて画面上の状態がリアルタイムに変化し、正解の配置に近づいた瞬間に「ピタッ！」と磁石のように吸着（Snap）するなどの気持ちいい反応（JavaScriptでの当たり判定）を実装すること。`;

const DEFAULT_QUALITY_SAMPLE = `## 【品質参考サンプル】
以下は「インタラクションの水準・アニメーション・タッチ操作の実装レベル」の参考例です。
⚠️ テーマ・キャラクター・教科内容・ゲームのルールは一切参考にしないこと。「どう作るか（How）」の品質基準としてのみ使用すること。

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>足し算 マスター！</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@400;500&family=Mochiy+Pop+P+One&display=swap');
        :root { --primary-bg: #E0F8E8; --accent-color: #1CB0F6; --text-dark: #1a1a1a; --safe-top: 60px; }
        body { font-family: 'Kiwi Maru', serif; background: var(--primary-bg); margin: 0; padding: 0; overflow: hidden; width: 100vw; height: 100vh; touch-action: none; user-select: none; }
        .title-font { font-family: 'Mochiy Pop P One', sans-serif; }
        .logo-wrapper { position: relative; display: inline-flex; flex-direction: column; align-items: center; width: 240px; max-width: 80vw; transform: rotate(-1deg); }
        .logo-line { display: flex; justify-content: space-between; width: 100%; color: var(--text-dark); }
        .logo-main { font-size: 3.5rem; line-height: 1; }
        .logo-sub { font-size: 2.5rem; line-height: 1; margin-top: 0.2rem; }
        .sparkle-icon { position: absolute; fill: #fff; animation: sparkleAnim 2.3s infinite ease-in-out; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15)); z-index: 10; }
        @keyframes sparkleAnim { 0%, 100% { transform: scale(1) rotate(0); opacity: 1; } 50% { transform: scale(0.7) rotate(20deg); opacity: 0.7; } }
        .poyon { animation: poyon 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes poyon { 0% { transform: scale(0.8); } 50% { transform: scale(1.1); } 100% { transform: scale(1.0); } }
        .ten-frame-slot { background: rgba(255,255,255,0.6); border: 3px dashed rgba(0,0,0,0.1); border-radius: 12px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .ten-frame-slot.filled { border: 3px solid #fff; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .equation-box { background: rgba(255,255,255,0.9); border-radius: 16px; box-shadow: 0 6px 0 rgba(0,0,0,0.05); }
        .progress-bar { height: 12px; background: rgba(0,0,0,0.08); border-radius: 6px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(to right, #4ade80, var(--accent-color)); transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); width: 0%; }
        .screen { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; padding: var(--safe-top) 1rem 1rem 1rem; background: var(--primary-bg); width: 100%; height: 100%; overflow: hidden; }
        .hidden-screen { opacity: 0; pointer-events: none; transform: translateY(20px); }
        .common-header { width: 100%; max-width: 32rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex: 0 0 auto; }
        .back-to-top-btn { background: white; border-radius: 1rem; padding: 0.5rem 0.8rem; display: flex; align-items: center; gap: 0.4rem; color: var(--text-dark); font-weight: bold; font-size: 0.875rem; box-shadow: 0 4px 0 #000; transition: all 0.2s; }
        .back-to-top-btn:active { box-shadow: 0 0 0 transparent; transform: translateY(4px); }
        .stage-btn { width: 100%; padding: 0.75rem; border-radius: 1.25rem; font-weight: bold; text-align: left; position: relative; transition: all 0.2s; border: 3px solid var(--text-dark); border-bottom-width: 6px; border-bottom-color: #000; }
        .stage-btn:active { border-bottom-width: 3px; transform: translateY(3px); }
        .stage-btn-active { background: white; color: #1e293b; }
        .stage-btn-locked { background: rgba(255,255,255,0.3); color: rgba(0,0,0,0.4); border-color: rgba(0,0,0,0.2); border-bottom-color: #000; cursor: not-allowed; pointer-events: none; opacity: 0.7; }
        .clear-badge { background: #10b981; color: white; font-size: 0.6rem; padding: 2px 8px; border-radius: 999px; display: flex; align-items: center; gap: 4px; }
        .stage-label { color: var(--accent-color); font-weight: 900; font-size: 0.75rem; }
        .play-container { display: flex; flex-direction: column; width: 100%; max-width: 32rem; flex: 1 1 auto; justify-content: center; gap: 1.5rem; }
        .play-section { display: flex; flex-direction: column; align-items: center; width: 100%; }
    </style>
</head>
<body class="bg-[#E0F8E8]">
    <div id="screen-top" class="screen">
        <div class="flex-grow flex items-center justify-center w-full">
            <div class="logo-wrapper">
                <svg class="sparkle-icon" style="top: -30px; left: -30px; width: 50px;" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>
                <svg class="sparkle-icon" style="top: 10px; right: -40px; width: 40px; animation-delay: 0.5s;" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>
                <h1 class="title-font">
                    <div class="logo-line logo-main"><span>足</span><span>し</span><span>算</span></div>
                    <div class="logo-line logo-sub"><span>マ</span><span>ス</span><span>タ</span><span>ー</span><span>！</span></div>
                </h1>
            </div>
        </div>
        <div class="flex flex-col gap-3 w-full max-w-md px-4 mb-8 flex-shrink-0">
            <button onclick="goToProblemIntro()" class="stage-btn stage-btn-active flex flex-col">
                <div class="flex justify-between items-center w-full mb-0.5">
                    <span class="stage-label">ステージ１</span>
                    <div id="stage-1-clear-badge" class="clear-badge hidden poyon"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>クリア！</span></div>
                </div>
                <span class="text-lg title-font">10の合成・分解</span>
                <span class="text-[10px] text-gray-500 font-bold">あといくつで10か？</span>
            </button>
            <button class="stage-btn stage-btn-locked flex flex-col">
                <div class="flex justify-between items-center w-full mb-0.5"><span class="stage-label">ステージ２</span><span class="text-[9px] bg-black/40 text-white px-2 py-0.5 rounded-full">※開発中</span></div>
                <span class="text-lg title-font">加数の分解</span><span class="text-[10px] font-bold">７をわける</span>
            </button>
            <button class="stage-btn stage-btn-locked flex flex-col">
                <div class="flex justify-between items-center w-full mb-0.5"><span class="stage-label">ステージ３</span><span class="text-[9px] bg-black/40 text-white px-2 py-0.5 rounded-full">※開発中</span></div>
                <span class="text-lg title-font">加法（繰り上がり）</span><span class="text-[10px] font-bold">さくらんぼ計算</span>
            </button>
        </div>
        <div class="w-full max-w-md text-center pb-2 flex-shrink-0">
            <div class="text-[10px] text-gray-800/60 leading-tight font-bold">単元：【足し算（くり上がり）】<br>対象：小学1年生 1学期</div>
        </div>
    </div>
    <div id="screen-intro" class="screen hidden-screen">
        <div class="common-header">
            <button onclick="resetToTop()" class="back-to-top-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>やめる</span></button>
            <div class="flex flex-col items-end flex-1 max-w-[150px]">
                <span class="level-indicator text-[10px] font-bold text-blue-800 mb-1 uppercase tracking-wider">LEVEL 1/3</span>
                <div class="progress-bar w-full"><div class="progress-fill"></div></div>
            </div>
        </div>
        <div class="flex-grow flex flex-col justify-center items-center w-full max-w-md">
            <div class="bg-white rounded-3xl p-6 shadow-2xl border-4 border-black/10 inline-block mb-8">
                <div class="flex items-center gap-4 text-4xl font-bold text-gray-800">
                    <span id="intro-eq-base">7</span><span class="text-[#1CB0F6]">+</span>
                    <div class="w-14 h-14 bg-blue-50 border-4 border-dashed border-blue-200 rounded-2xl flex items-center justify-center text-blue-300">?</div>
                    <span class="text-gray-400">=</span><span class="text-3xl bg-[#1CB0F6] text-white px-4 py-2 rounded-2xl shadow-lg">10</span>
                </div>
            </div>
            <p class="text-lg font-bold text-gray-800 mb-10 title-font text-center">あと いくつで 10に なるかな？</p>
            <button onclick="startGame()" class="poyon bg-[#1CB0F6] text-white text-xl font-bold px-12 py-5 rounded-full border-b-8 border-blue-900 active:border-b-0 active:translate-y-2 transition-all title-font w-full max-w-[280px]">やってみる！</button>
        </div>
    </div>
    <div id="screen-play" class="screen hidden-screen">
        <div class="common-header">
            <button onclick="resetToTop()" class="back-to-top-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>やめる</span></button>
            <div class="flex flex-col items-end flex-1 max-w-[150px]">
                <span class="level-indicator text-[10px] font-bold text-blue-800 mb-1 uppercase tracking-wider">LEVEL 1/3</span>
                <div class="progress-bar w-full"><div class="progress-fill"></div></div>
            </div>
        </div>
        <div class="play-container">
            <div class="play-section">
                <div class="equation-box px-6 py-3 flex items-center gap-4 text-2xl font-bold text-gray-800">
                    <span id="eq-base">7</span><span class="text-[#1CB0F6]">+</span>
                    <div id="eq-target" class="w-10 h-10 bg-white border-4 border-[#1CB0F6] rounded-xl flex items-center justify-center text-[#1CB0F6]">?</div>
                    <span class="text-gray-400">=</span><span class="text-xl bg-[#1CB0F6] text-white px-3 py-1 rounded-full shadow-sm">10</span>
                </div>
            </div>
            <div class="play-section">
                <div id="ten-frame" class="grid grid-cols-5 grid-rows-2 gap-2 p-2 bg-white/40 rounded-2xl shadow-inner border-4 border-white/50"></div>
            </div>
            <div class="play-section">
                <div class="w-full bg-white/90 rounded-2xl p-4 flex flex-col items-center">
                    <p class="text-xs text-gray-700 mb-2 font-bold title-font"><ruby>星<rt>ほし</rt></ruby>を <ruby>枠<rt>わく</rt></ruby>まで はこぼう</p>
                    <div id="star-supply" class="flex flex-wrap justify-center gap-3 min-h-[50px]"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="drag-proxy" style="position: fixed; pointer-events: none; z-index: 100; display: none;">
        <svg width="45" height="45" viewBox="0 0 24 24" fill="#FFDE00" stroke="#f59e0b" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    </div>
    <div id="success-overlay" class="fixed inset-0 bg-white/95 z-40 flex flex-col items-center justify-center hidden">
        <div class="poyon text-center flex flex-col items-center">
            <svg class="mb-6" width="90" height="90" viewBox="0 0 24 24" fill="#FFDE00" stroke="#f59e0b" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <h2 class="text-2xl font-bold text-gray-800 mb-2 title-font text-center">すごーい！</h2>
            <p class="text-lg text-[#1CB0F6] font-bold mb-8 text-center">10のまとまりが できたね！</p>
            <button onclick="goToIntro()" class="bg-[#1CB0F6] text-white text-xl font-bold px-12 py-4 rounded-full border-b-8 border-blue-900 active:border-b-0 active:translate-y-2 transition-all title-font">つぎの もんだい</button>
        </div>
    </div>
    <div id="final-clear-screen" class="fixed inset-0 bg-[#E0F8E8] z-50 flex flex-col items-center justify-center hidden">
        <div class="poyon text-center p-6 flex flex-col items-center w-full max-w-md">
            <svg class="mb-6" width="100" height="100" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" stroke-width="1"><path d="M18 2H6a2 2 0 00-2 2v2c0 1.1.9 2 2 2h2v4a4 4 0 004 4h0a4 4 0 004-4V8h2a2 2 0 002-2V4a2 2 0 00-2-2zM4 6V4h2v2H4zm16 0h-2V4h2v2zM12 16a2 2 0 01-2 2v2h4v-2a2 2 0 01-2-2z"/></svg>
            <h2 class="text-3xl font-bold text-gray-800 mb-3 title-font text-center">ぜんぶ クリア！</h2>
            <p class="text-xl text-orange-600 font-bold mb-8 text-center">10のまとまり マスターだね！</p>
            <button class="w-full bg-black/05 text-black/20 text-lg font-bold py-4 rounded-full border-4 border-dashed border-black/10 mb-4 cursor-not-allowed pointer-events-none title-font">つぎの ステージへ<br><span class="text-xs font-bold opacity-60">※開発中</span></button>
            <button onclick="markAsClearedAndReset()" class="w-full bg-[#1CB0F6] text-white text-xl font-bold px-12 py-5 rounded-full border-b-8 border-blue-900 active:border-b-0 active:translate-y-2 transition-all title-font">トップにもどる</button>
        </div>
    </div>
    <script>
        const levels = [{ base: 7, target: 3 },{ base: 8, target: 2 },{ base: 6, target: 4 },{ base: 5, target: 5 },{ base: 9, target: 1 }];
        const MAX_LEVELS = 3;
        let currentLevelIndex = 0, solvedCount = 0, placedCount = 0, isDragging = false, activeStarElement = null, stage1Cleared = false;
        const screenTop = document.getElementById('screen-top');
        const screenIntro = document.getElementById('screen-intro');
        const screenPlay = document.getElementById('screen-play');
        const tenFrame = document.getElementById('ten-frame');
        const starSupply = document.getElementById('star-supply');
        const eqBase = document.getElementById('eq-base');
        const eqTarget = document.getElementById('eq-target');
        const dragProxy = document.getElementById('drag-proxy');
        const introEqBase = document.getElementById('intro-eq-base');
        const finalClearScreen = document.getElementById('final-clear-screen');
        const stage1Badge = document.getElementById('stage-1-clear-badge');
        const starSVG = \`<svg class="star-item" width="42" height="42" viewBox="0 0 24 24" fill="#ffcc00" stroke="#f59e0b" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\`;
        function updateHeaders(isSolving = false) {
            const indicators = document.querySelectorAll('.level-indicator');
            const fills = document.querySelectorAll('.progress-fill');
            indicators.forEach(el => el.innerText = \`LEVEL \${currentLevelIndex + 1}/\${MAX_LEVELS}\`);
            const progress = ((solvedCount + (isSolving ? 1 : 0)) / MAX_LEVELS) * 100;
            fills.forEach(el => el.style.width = \`\${progress}%\`);
        }
        function goToProblemIntro() { screenTop.classList.add('hidden-screen'); initIntro(); }
        function initIntro() {
            const level = levels[currentLevelIndex];
            introEqBase.innerText = level.base;
            updateHeaders();
            screenIntro.classList.remove('hidden-screen');
            screenPlay.classList.add('hidden-screen');
        }
        function startGame() { screenIntro.classList.add('hidden-screen'); screenPlay.classList.remove('hidden-screen'); setupPlayArea(); }
        function setupPlayArea() {
            const level = levels[currentLevelIndex];
            placedCount = 0; tenFrame.innerHTML = ''; starSupply.innerHTML = '';
            eqBase.innerText = level.base; eqTarget.innerText = '?'; eqTarget.style.color = '#cbd5e1';
            updateHeaders();
            for (let i = 0; i < 10; i++) {
                const slot = document.createElement('div');
                slot.className = 'ten-frame-slot';
                if (i < level.base) { slot.classList.add('filled'); slot.innerHTML = starSVG; }
                tenFrame.appendChild(slot);
            }
            for (let i = 0; i < level.target; i++) {
                const starWrap = document.createElement('div');
                starWrap.className = 'poyon flex items-center justify-center';
                starWrap.innerHTML = starSVG;
                starWrap.style.animationDelay = \`\${i * 0.1}s\`;
                starWrap.addEventListener('touchstart', handleStart, {passive: false});
                starWrap.addEventListener('mousedown', handleStart);
                starSupply.appendChild(starWrap);
            }
        }
        function handleStart(e) {
            e.preventDefault(); isDragging = true;
            activeStarElement = e.target.closest('.poyon') || e.target.closest('svg');
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            updateProxyPos(clientX, clientY); dragProxy.style.display = 'block';
            if (activeStarElement) activeStarElement.style.opacity = '0.2';
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove, {passive: false});
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }
        function handleMove(e) {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            updateProxyPos(clientX, clientY); checkHover(clientX, clientY);
        }
        function handleEnd(e) {
            if (!isDragging) return;
            isDragging = false; dragProxy.style.display = 'none';
            if (activeStarElement) activeStarElement.style.opacity = '1';
            const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
            const targetSlot = findEmptySlotAt(clientX, clientY);
            if (targetSlot) {
                targetSlot.classList.add('filled', 'poyon'); targetSlot.innerHTML = starSVG;
                if (activeStarElement) activeStarElement.remove();
                placedCount++; updateEquation();
            }
            window.removeEventListener('mousemove', handleMove); window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd); window.removeEventListener('touchend', handleEnd);
        }
        function updateProxyPos(x, y) { dragProxy.style.left = (x - 22) + 'px'; dragProxy.style.top = (y - 22) + 'px'; }
        function checkHover(x, y) {
            document.querySelectorAll('.ten-frame-slot').forEach(slot => {
                const rect = slot.getBoundingClientRect();
                const over = x > rect.left && x < rect.right && y > rect.top && y < rect.bottom && !slot.classList.contains('filled');
                slot.style.background = over ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)';
                slot.style.borderColor = over ? '#1CB0F6' : 'rgba(0,0,0,0.1)';
            });
        }
        function findEmptySlotAt(x, y) {
            for (let slot of document.querySelectorAll('.ten-frame-slot')) {
                const rect = slot.getBoundingClientRect();
                if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom && !slot.classList.contains('filled')) return slot;
            }
            return null;
        }
        function updateEquation() {
            eqTarget.innerText = placedCount; eqTarget.style.color = '#1CB0F6';
            if (placedCount === levels[currentLevelIndex].target) showSuccess();
        }
        function showSuccess() {
            updateHeaders(true);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#1CB0F6', '#4ade80', '#FFFFFF'] });
            setTimeout(() => {
                solvedCount++;
                if (solvedCount >= MAX_LEVELS) finalClearScreen.classList.remove('hidden');
                else document.getElementById('success-overlay').classList.remove('hidden');
            }, 800);
        }
        function goToIntro() { document.getElementById('success-overlay').classList.add('hidden'); currentLevelIndex++; initIntro(); }
        function markAsClearedAndReset() { stage1Cleared = true; renderTopScreen(); resetToTop(); }
        function renderTopScreen() { stage1Cleared ? stage1Badge.classList.remove('hidden') : stage1Badge.classList.add('hidden'); }
        function resetToTop() {
            finalClearScreen.classList.add('hidden');
            document.getElementById('success-overlay').classList.add('hidden');
            currentLevelIndex = 0; solvedCount = 0;
            screenTop.classList.remove('hidden-screen');
            screenIntro.classList.add('hidden-screen');
            screenPlay.classList.add('hidden-screen');
        }
        document.addEventListener('contextmenu', e => e.preventDefault());
    </script>
</body>
</html>`;

export default function CreatePage() {
    const router = useRouter();
    const [currentHtml, setCurrentHtml] = useState<string>('');
    const [systemInstruction, setSystemInstruction] = useState<string>(DEFAULT_SYSTEM_INSTRUCTION);
    const [headerPrompt, setHeaderPrompt] = useState<string>(DEFAULT_HEADER_PROMPT);
    const [footerPrompt, setFooterPrompt] = useState<string>(DEFAULT_FOOTER_PROMPT);
    const [userPrompt, setUserPrompt] = useState<string>('');
    const [qualitySample, setQualitySample] = useState<string>(DEFAULT_QUALITY_SAMPLE);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number | null; candidatesTokens: number | null; totalTokens: number | null } | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [iframeScale, setIframeScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(812);
    const iframeContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = iframeContainerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setIframeScale(width / 375);
            setContainerHeight(height);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleSubmit = async () => {
        if (!userPrompt.trim()) return;
        const isFirstSubmission = !currentHtml;
        setIsStreaming(true);
        setStreamingText('');
        setCurrentHtml('');
        setError(null);
        setTokenUsage(null);

        let accumulated = '';

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction,
                    headerPrompt,
                    footerPrompt,
                    userPrompt,
                    currentHtml,
                    qualitySample: isFirstSubmission ? qualitySample : '',
                }),
            });

            if (!res.ok || !res.body) {
                const data = await res.json();
                setError(data.error ?? '不明なエラーが発生しました');
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                accumulated += decoder.decode(value, { stream: true });

                const delimIdx = accumulated.indexOf(USAGE_DELIMITER);
                if (delimIdx !== -1) {
                    const htmlPart = accumulated.slice(0, delimIdx);
                    const usageStr = accumulated.slice(delimIdx + USAGE_DELIMITER.length);
                    try {
                        const usageData = JSON.parse(usageStr.trim());
                        setTokenUsage(usageData);
                    } catch { /* usageパース失敗は無視 */ }
                    accumulated = htmlPart;
                    setStreamingText(htmlPart);
                    break;
                }

                setStreamingText(accumulated);
            }

            setCurrentHtml(extractHtml(accumulated));
        } catch {
            setError('通信エラーが発生しました');
        } finally {
            setIsStreaming(false);
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
                    disabled={!currentHtml || isStreaming}
                    onClick={() => setIsPostModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold shadow active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Upload className="w-4 h-4" />
                    投稿する
                </button>
            </div>

            {/* ── 上半分: スマホモックアッププレビュー ── */}
            <div
                className="flex-1 min-h-0 flex items-center justify-center relative py-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/bg-main.png')" }}
            >
                {/* スマホモックアップ */}
                <div className="h-[97%] max-h-full aspect-[9/16] bg-black border-[12px] border-black rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
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
                    <div ref={iframeContainerRef} className="flex-1 min-h-0 mt-5 relative overflow-hidden">
                        {isStreaming ? (
                            <>
                                <TerminalView text={streamingText} />
                                {/* ローディングオーバーレイ */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
                                    <div className="relative w-24 h-24">
                                        {/* 外側：ゆっくり回る破線リング */}
                                        <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-orange-300 animate-spin" style={{ animationDuration: '3s' }} />
                                        {/* 内側：速いオレンジスピナー */}
                                        <div className="absolute inset-2 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" style={{ animationDuration: '0.75s' }} />
                                        {/* 中心：ぽよんと光る丸 */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-11 h-11 bg-orange-50 rounded-full animate-pulse shadow-inner" />
                                        </div>
                                        {/* 軌道ドット×3 */}
                                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow" />
                                        </div>
                                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.67s' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-orange-400 rounded-full shadow" />
                                        </div>
                                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '1.33s' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-pink-400 rounded-full shadow" />
                                        </div>
                                    </div>
                                    <p className="text-orange-500 text-sm font-bold animate-bounce tracking-wide drop-shadow-sm">アプリ開発中...</p>
                                </div>
                            </>
                        ) : currentHtml ? (
                            <iframe
                                srcDoc={currentHtml}
                                sandbox="allow-scripts"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '375px',
                                    height: `${containerHeight / iframeScale}px`,
                                    border: 'none',
                                    transformOrigin: 'top left',
                                    transform: `scale(${iframeScale})`,
                                }}
                                title="生成プレビュー"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500 text-xs px-4 text-center leading-relaxed">
                                {'プロンプトを入力して\n「送信」を押すと\nここにアプリが表示されます'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 下半分: 操作パネル ── */}
            <div className="flex flex-col gap-2 px-4 pt-3 pb-4 bg-gray-50 border-t border-gray-200 shrink-0">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 shrink-0">
                        {error}
                    </div>
                )}

                {/* ── DEBUG エリア ── */}
                <div className="flex flex-col gap-2 border-2 border-dashed border-gray-300 rounded-2xl p-3 shrink-0 max-h-36 overflow-y-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center">For Debug</span>

                    {/* システム指示 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            システム指示（System Instruction）
                        </label>
                        <textarea
                            value={systemInstruction}
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            rows={2}
                            className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                    </div>

                    {/* ベースプロンプト1（ヘッダー） */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            ベースプロンプト1（ヘッダー）
                        </label>
                        <textarea
                            value={headerPrompt}
                            onChange={(e) => setHeaderPrompt(e.target.value)}
                            rows={2}
                            className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    {/* ベースプロンプト2（フッター） */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            ベースプロンプト2（フッター）
                        </label>
                        <textarea
                            value={footerPrompt}
                            onChange={(e) => setFooterPrompt(e.target.value)}
                            rows={2}
                            className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    {/* 品質参考サンプル（初回送信のみ使用） */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            品質参考サンプル <span className="text-gray-300 normal-case font-normal">（初回送信のみ）</span>
                        </label>
                        <textarea
                            value={qualitySample}
                            onChange={(e) => setQualitySample(e.target.value)}
                            rows={2}
                            placeholder="高品質なHTMLサンプルをここに貼る（2回目以降は送信されません）"
                            className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400"
                        />
                    </div>

                    {/* 送信内容プレビュー */}
                    {(() => {
                        const isFirst = !currentHtml;
                        const labels = isFirst
                            ? ['システム指示', 'ヘッダー', 'ユーザー指示', 'フッター', ...(qualitySample.trim() ? ['品質参考サンプル'] : [])]
                            : ['システム指示', '修正指示＋現在のHTML', 'フッター'];
                        return (
                            <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono flex flex-col gap-0.5">
                                <div>
                                    <span className="font-bold text-gray-600">Gemini APIモデル：</span>
                                    <span>gemini-3-flash-preview</span>
                                </div>
                                <div>
                                    <span className="font-bold text-gray-600">[送信内容] </span>
                                    {labels.map((label, i) => (
                                        <span key={i}>{i + 1}.{label}{i < labels.length - 1 ? ' ＋ ' : ''}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* ユーザー入力 */}
                <p className="text-sm font-bold text-blue-600 shrink-0 text-center">▼アプリ開発の指示を入力してください！</p>
                <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={2}
                    placeholder="例: 足し算の練習ゲームを作って。カラフルで楽しい雰囲気で。"
                    className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300 shrink-0"
                />

                <button
                    onClick={handleSubmit}
                    disabled={isStreaming || !userPrompt.trim()}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {isStreaming ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            生成中...
                        </>
                    ) : currentHtml ? (
                        <>
                            <RefreshCw className="w-4 h-4" />
                            修正
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            送信
                        </>
                    )}
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
