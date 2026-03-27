'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, ChevronLeft, ChevronDown, Upload, Wifi, Battery, Signal } from 'lucide-react';
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
以下の【絶対遵守のプロトコル】に従い、1つのHTMLファイル（CSS/JS内包）として、スマホの指での操作に特化した「遊んで学べる教育アプリ」を開発してください。

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
その上で、あなたのAIとしての創造力と教育の専門知識のすべてを、**『子供がさわって遊びながら、いつの間にか本質的な理解に到達する【教育ロジックの考案】』**に注ぎ込んでください。
圧倒的なクオリティを期待しています。

▼今回の開発テーマ（単元）`;

const DEFAULT_FOOTER_PROMPT = `## 【学習設計要件：指導要領の「段階的」教育アプリ化】
* **スモールステップ設計**:
提示された「学習指導要領の項目」をそのまま丸投げするのではなく、子供が無理なく概念を理解できるように、**AI自身で「段階的（ステップバイステップ）」な学習プロセスを構成**してください。
* **難易度のグラデーション**:
最初は簡単な操作や発見（例：概念に気づく）から始まり、徐々に実践的な操作（例：実際に動かして解く、応用する）へと、アプリ内で難易度やシーンが自然に遷移するギミックを実装してください。

## 【アプリ構造・レイアウト要件】
* **画面構成とState管理**:
アプリは必ず「Top画面」「プレイ画面（実践＆納得）」「全クリア画面」を持つSPAとして実装すること。

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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>キラキラとけい</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        * { -webkit-tap-highlight-color: transparent; user-select: none; }
        @media (max-height: 700px) {
            .clock-container { width: 55vw !important; height: 55vw !important; max-width: 220px !important; max-height: 220px !important; }
            .character-area { height: 6rem !important; }
            .title-logo { margin-top: 0 !important; }
        }
    </style>
</head>
<body class="bg-pink-50 font-sans text-slate-700 overflow-hidden h-[100dvh] w-screen touch-manipulation">
    <div id="app" class="h-full w-full relative flex flex-col"></div>
    <script>
        const STAGES = [
            { level: 1, title: 'じかんのくに', description: 'なんじ かな？', type: 'hour' },
            { level: 2, title: 'はんぶんの森', description: 'なんじ はん かな？', type: 'half' },
            { level: 3, title: 'ふしぎな泉', description: '15ふん と 45ふん', type: 'quarter' },
            { level: 4, title: '星のまたたき', description: '5ふん きざみ', type: 'five_min' },
            { level: 5, title: '時計の塔', description: 'なんじ なんぷん？', type: 'exact' }
        ];
        const QUESTIONS_PER_STAGE = 5;
        const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const generateProblem = (stageType) => {
            let hour = randomInt(1, 12);
            let minute = 0;
            switch (stageType) {
                case 'hour': minute = 0; break;
                case 'half': minute = 30; break;
                case 'quarter': minute = Math.random() > 0.5 ? 15 : 45; break;
                case 'five_min': minute = randomInt(0, 11) * 5; break;
                case 'exact': minute = randomInt(0, 59); break;
                default: minute = 0;
            }
            const correctTime = { hour, minute };
            const options = [correctTime];
            while (options.length < 4) {
                let dHour = randomInt(1, 12);
                let dMinute = 0;
                if (stageType === 'hour') dMinute = 0;
                else if (stageType === 'half') dMinute = 30;
                else if (stageType === 'exact' || stageType === 'five_min') {
                    const offset = randomInt(-2, 2) * 5;
                    dMinute = (minute + offset + 60) % 60;
                } else { dMinute = randomInt(0, 11) * 5; }
                const isDuplicate = options.some(o => o.hour === dHour && o.minute === dMinute);
                if (!isDuplicate) options.push({ hour: dHour, minute: dMinute });
            }
            return { correctTime, options: options.sort(() => Math.random() - 0.5) };
        };
        const formatTime = (t) => {
            const m = t.minute === 0 ? '00' : t.minute < 10 ? \`0\${t.minute}\` : t.minute;
            return \`\${t.hour}:\${m}\`;
        };
        const Icons = {
            Unicorn: (className) => \`<svg viewBox="0 0 100 100" class="\${className}"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M45,25 Q35,35 30,50" stroke="#FF99CC" stroke-width="4" /><path d="M50,25 Q40,40 35,55" stroke="#99CCFF" stroke-width="4" /><path d="M55,30 Q45,45 40,60" stroke="#CC99FF" stroke-width="4" /><path d="M55,15 L60,35" stroke="#FFD700" stroke-width="3" /><path d="M60,35 Q75,35 80,45 Q85,55 75,60 L65,60 Q65,80 70,90" stroke="#666" stroke-width="3" fill="#FFF" /><path d="M65,60 Q45,60 40,80 L40,90" stroke="#666" stroke-width="3" fill="#FFF" /><path d="M40,80 Q30,70 30,50 Q30,30 50,25" stroke="#666" stroke-width="3" fill="#FFF" /><path d="M65,45 Q68,42 71,45" stroke="#666" stroke-width="2" /></g></svg>\`,
            Castle: (className) => \`<svg viewBox="0 0 100 100" class="\${className}"><path d="M20,90 L20,50 L10,50 L25,20 L40,50 L30,50 L30,90" fill="#E0F7FA" stroke="#4DD0E1" stroke-width="2" /><path d="M80,90 L80,50 L90,50 L75,20 L60,50 L70,50 L70,90" fill="#E0F7FA" stroke="#4DD0E1" stroke-width="2" /><path d="M30,90 L30,40 L70,40 L70,90" fill="#F3E5F5" stroke="#BA68C8" stroke-width="2" /><path d="M30,40 L50,10 L70,40" fill="#F8BBD0" stroke="#F06292" stroke-width="2" /><rect x="45" y="60" width="10" height="30" rx="5" fill="#FFF" stroke="#BA68C8" /></svg>\`,
            MagicWand: (className) => \`<svg viewBox="0 0 100 100" class="\${className}"><line x1="20" y1="80" x2="50" y2="50" stroke="#FFD700" stroke-width="6" stroke-linecap="round" /><path d="M50,20 L58,40 L80,40 L62,52 L68,75 L50,60 L32,75 L38,52 L20,40 L42,40 Z" fill="#F48FB1" stroke="#F06292" stroke-width="2" /></svg>\`,
            Ribbon: (className, color) => \`<svg viewBox="0 0 100 60" class="\${className}"><path d="M30,30 Q10,10 10,40 L30,30" fill="\${color}" stroke="#FFF" stroke-width="2" /><path d="M70,30 Q90,10 90,40 L70,30" fill="\${color}" stroke="#FFF" stroke-width="2" /><circle cx="50" cy="30" r="10" fill="#FFF" stroke="\${color}" stroke-width="3" /></svg>\`,
            Rainbow: (className) => \`<svg viewBox="0 0 100 50" class="\${className}"><path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#FFCDD2" stroke-width="6" /><path d="M20,50 A30,30 0 0,1 80,50" fill="none" stroke="#FFF9C4" stroke-width="6" /><path d="M30,50 A20,20 0 0,1 70,50" fill="none" stroke="#E1BEE7" stroke-width="6" /></svg>\`,
            Star: (className, fill) => \`<svg viewBox="0 0 24 24" class="\${className}" fill="\${fill}" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>\`,
            Heart: (className) => \`<svg viewBox="0 0 24 24" class="\${className}" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>\`,
            Sparkles: (className) => \`<svg viewBox="0 0 24 24" class="\${className}" fill="currentColor" stroke="none"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>\`,
            Cloud: (className) => \`<svg viewBox="0 0 24 24" class="\${className}" fill="currentColor" stroke="none"><path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1c-.2-3.2-2.7-5.5-5.9-5.5-3.3 0-6 2.7-6 6 0 .3 0 .5.1.8-2 .7-3.6 2.6-3.6 4.7 0 2.8 2.2 5 5 5h14.5c2.8 0 5-2.2 5-5s-2.2-5-5-5z" /></svg>\`,
            ArrowRight: () => \`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>\`,
            RefreshCw: () => \`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>\`
        };
        const state = {
            gameState: 'title',
            currentStageIndex: 0,
            progress: 0,
            problem: null,
            feedback: null,
            isSparkling: false
        };
        const appContainer = document.getElementById('app');
        const triggerSparkle = () => {
            const container = document.createElement('div');
            container.className = 'absolute inset-0 pointer-events-none overflow-hidden z-50';
            for (let i = 0; i < 15; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'absolute animate-ping opacity-75';
                sparkle.style.left = \`\${Math.random() * 100}%\`;
                sparkle.style.top = \`\${Math.random() * 100}%\`;
                sparkle.style.animationDuration = \`\${0.5 + Math.random()}s\`;
                sparkle.style.animationDelay = \`\${Math.random() * 0.3}s\`;
                const colors = ['#FFD700', '#FF99CC', '#81D4FA'];
                sparkle.style.color = colors[Math.floor(Math.random() * 3)];
                sparkle.style.width = \`\${24 + Math.random() * 30}px\`;
                sparkle.style.height = \`\${24 + Math.random() * 30}px\`;
                sparkle.innerHTML = Icons.Sparkles('w-full h-full');
                container.appendChild(sparkle);
            }
            appContainer.appendChild(container);
            setTimeout(() => { if (container.parentNode) container.parentNode.removeChild(container); }, 2000);
        };
        const renderClock = (hour, minute) => {
            const hourDegrees = (hour % 12) * 30 + minute * 0.5;
            const minuteDegrees = minute * 6;
            let numbersHtml = '';
            for (let i = 1; i <= 12; i++) {
                const angle = (i * 30) * (Math.PI / 180);
                const x = 50 + 40 * Math.sin(angle);
                const y = 50 - 40 * Math.cos(angle);
                numbersHtml += \`<div class="absolute text-2xl sm:text-3xl font-bold text-slate-500 font-mono" style="left: \${x}%; top: \${y}%; transform: translate(-50%, -50%)">\${i}</div>\`;
            }
            let dotsHtml = '';
            for (let i = 0; i < 60; i++) {
                if (i % 5 !== 0) {
                    const angle = (i * 6) * (Math.PI / 180);
                    const x = 50 + 46 * Math.sin(angle);
                    const y = 50 - 46 * Math.cos(angle);
                    dotsHtml += \`<div class="absolute w-1 h-1 bg-slate-200 rounded-full" style="left: \${x}%; top: \${y}%; transform: translate(-50%, -50%)"></div>\`;
                }
            }
            return \`<div class="clock-container relative w-[60vw] h-[60vw] max-w-[280px] max-h-[280px] bg-white rounded-full border-8 border-purple-200 shadow-xl flex items-center justify-center mx-auto z-10">\${numbersHtml}\${dotsHtml}<div class="absolute w-4 h-4 bg-purple-400 rounded-full z-20"></div><div class="absolute w-2 bg-slate-700 rounded-full z-10 origin-bottom" style="height: 28%; bottom: 50%; left: calc(50% - 1px); transform: rotate(\${hourDegrees}deg); transition: transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44);"></div><div class="absolute w-1.5 bg-purple-400 rounded-full z-10 origin-bottom" style="height: 42%; bottom: 50%; left: calc(50% - 0.75px); transform: rotate(\${minuteDegrees}deg); transition: transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44);"></div></div>\`;
        };
        const loadNextProblem = () => {
            const stageType = STAGES[state.currentStageIndex].type;
            let newProblem, retryCount = 0;
            do {
                newProblem = generateProblem(stageType);
                retryCount++;
            } while (state.problem && newProblem.correctTime.hour === state.problem.correctTime.hour && newProblem.correctTime.minute === state.problem.correctTime.minute && retryCount < 10);
            state.problem = newProblem;
            state.feedback = null;
            renderApp();
        };
        const startGame = () => { state.currentStageIndex = 0; state.progress = 0; state.gameState = 'playing'; loadNextProblem(); };
        const nextStage = () => {
            const nextIdx = state.currentStageIndex + 1;
            if (nextIdx >= STAGES.length) { state.gameState = 'all_clear'; renderApp(); }
            else { state.currentStageIndex = nextIdx; state.progress = 0; state.gameState = 'playing'; loadNextProblem(); }
        };
        const checkAnswer = (selectedTime) => {
            if (state.feedback === 'correct') return;
            const isCorrect = selectedTime.hour === state.problem.correctTime.hour && selectedTime.minute === state.problem.correctTime.minute;
            if (isCorrect) {
                state.feedback = 'correct'; triggerSparkle(); renderApp();
                setTimeout(() => {
                    const nextProgress = state.progress + 1;
                    if (nextProgress >= QUESTIONS_PER_STAGE) { state.gameState = 'stage_clear'; renderApp(); }
                    else { state.progress = nextProgress; loadNextProblem(); }
                }, 2000);
            } else {
                state.feedback = 'incorrect'; renderApp();
                setTimeout(() => { state.feedback = null; renderApp(); }, 1500);
            }
        };
        const renderTitle = () => \`
            <div class="h-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-center p-4 pt-16 relative overflow-hidden font-sans">
                <div class="absolute top-24 left-[-20px] w-40 h-40 opacity-50">\${Icons.Rainbow('w-full h-full')}</div>
                <div class="absolute top-32 right-10 w-20 h-20 text-yellow-300 animate-spin-slow">\${Icons.Star('w-full h-full', '#FFF9C4')}</div>
                <div class="title-logo bg-white/80 backdrop-blur-sm p-6 rounded-[40px] shadow-xl text-center max-w-md w-full border-4 border-white relative z-10 mt-4">
                    <div class="flex justify-center -mt-14 mb-4">\${Icons.Castle('w-32 h-32 drop-shadow-md')}</div>
                    <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2 tracking-widest leading-tight">キラキラ<br/>とけい</h1>
                    <p class="text-slate-500 mb-6 font-bold text-sm">じかんの くにへ いこう！</p>
                    <button onclick="startGame()" class="w-full bg-gradient-to-r from-pink-300 to-purple-300 text-white text-xl font-bold py-4 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2">
                        \${Icons.MagicWand('w-6 h-6')} スタート！
                    </button>
                </div>
            </div>\`;
        const renderStageClear = () => \`
            <div class="h-full bg-gradient-to-r from-pink-50 to-blue-50 flex flex-col items-center justify-center p-4 pt-16 relative font-sans">
                <div class="bg-white/90 p-8 rounded-3xl shadow-xl text-center max-w-md w-full animate-fade-in-up border-4 border-pink-100 relative z-10">
                    <div class="absolute -top-12 left-1/2 transform -translate-x-1/2">\${Icons.Unicorn('w-32 h-32 drop-shadow-lg animate-bounce')}</div>
                    <h2 class="text-3xl font-bold text-purple-400 mt-16 mb-4">ステージ クリア！</h2>
                    <p class="text-xl text-slate-500 mb-8">やったね！とっても すてき！</p>
                    <button onclick="nextStage()" class="w-full bg-yellow-300 text-white text-2xl font-bold py-4 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2">
                        つぎへすすむ \${Icons.ArrowRight()}
                    </button>
                </div>
            </div>\`;
        const renderAllClear = () => {
            let bg = '';
            for(let i=0;i<20;i++){const c=['#fff','#ffd700','#ffc0cb'][i%3];const l=Math.random()*100;const t=Math.random()*100;const d=1+Math.random()*2;bg+=\`<div class="absolute rounded-full animate-ping" style="width:10px;height:10px;background:\${c};left:\${l}%;top:\${t}%;animation-duration:\${d}s"></div>\`;}
            return \`<div class="h-full bg-gradient-to-b from-purple-200 to-pink-200 flex flex-col items-center justify-center p-4 pt-16 relative overflow-hidden font-sans"><div class="absolute inset-0">\${bg}</div><div class="relative z-10 bg-white/90 p-8 rounded-[50px] shadow-2xl text-center max-w-lg w-full border-8 border-yellow-200"><div class="flex justify-center mb-6">\${Icons.Castle('w-24 h-24')}<div class="-ml-8">\${Icons.Unicorn('w-24 h-24')}</div></div><h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">おめでとう！！</h1><p class="text-xl text-slate-600 font-bold mb-6">すべての とけいを よめたね！<br/>あなたは すてきな<br/>「とけいマスター」！</p><button onclick="state.gameState='title';renderApp();" class="bg-pink-400 text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg transition transform hover:scale-105">さいしょから あそぶ</button></div></div>\`;
        };
        const renderGame = () => {
            const currentStage = STAGES[state.currentStageIndex];
            let progressDots = '';
            for(let i=0;i<QUESTIONS_PER_STAGE;i++){const a=i<state.progress?'bg-gradient-to-br from-yellow-300 to-orange-300 scale-110':'bg-slate-200';progressDots+=\`<div class="w-3 h-3 rounded-full transition-all border border-white \${a}"></div>\`;}
            let buttonsHtml = '';
            state.problem.options.forEach((option) => {
                const timeStr = formatTime(option);
                const optionJson = JSON.stringify(option).replace(/"/g, '&quot;');
                const shakeClass = state.feedback === 'incorrect' ? 'animate-shake' : '';
                const disabled = state.feedback === 'correct' ? 'disabled' : '';
                buttonsHtml += \`<button onclick='checkAnswer(\${optionJson})' \${disabled} class="py-3 rounded-2xl shadow-sm text-xl font-bold transition-all transform active:scale-95 border-b-4 active:border-b-0 bg-white text-slate-600 border-slate-100 hover:bg-pink-50 hover:text-pink-500 \${shakeClass}"><span class="font-mono tracking-wider">\${timeStr}</span></button>\`;
            });
            let feedbackHtml = '';
            if (state.feedback === 'correct') feedbackHtml = \`<div class="bg-yellow-100 text-yellow-600 px-2 py-3 rounded-2xl font-bold animate-bounce border-2 border-yellow-200 text-center flex items-center justify-center gap-1">\${Icons.Sparkles('w-5 h-5')} だいせいかい！ \${Icons.Sparkles('w-5 h-5')}</div>\`;
            else if (state.feedback === 'incorrect') feedbackHtml = \`<div class="bg-blue-100 text-blue-500 px-2 py-3 rounded-2xl font-bold animate-shake border-2 border-blue-200 text-center flex items-center justify-center gap-1">\${Icons.RefreshCw()} もういちど！</div>\`;
            else feedbackHtml = \`<div class="bg-white/90 text-slate-500 px-4 py-3 rounded-2xl border-2 border-pink-100 text-center text-sm">どれが 正解かな？</div>\`;
            const wandClass = state.feedback === 'correct' ? 'scale-125 rotate-12' : 'scale-100';
            const unicornClass = state.feedback === 'correct' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
            return \`<div class="h-full bg-pink-50 flex flex-col items-center font-sans overflow-hidden relative"><div class="w-full pt-12 px-4 pb-2 shrink-0 z-10"><div class="w-full max-w-lg mx-auto flex items-center justify-between bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm border border-pink-100"><span class="font-bold text-pink-500 text-xs px-2">Stage \${currentStage.level}: \${currentStage.title}</span><div class="flex gap-1">\${progressDots}</div></div></div><div class="flex-grow flex flex-col items-center justify-center w-full px-4 py-1 z-10 min-h-0"><h2 class="text-base font-bold text-purple-500 mb-2 bg-white/60 inline-block px-4 py-1 rounded-full">\${currentStage.description}</h2><div class="py-1 flex-shrink-0">\${renderClock(state.problem.correctTime.hour, state.problem.correctTime.minute)}</div><div class="character-area flex items-center justify-center w-full max-w-md mt-2 relative h-28 flex-shrink-0"><div class="absolute left-4 bottom-2 transition-transform duration-500 \${wandClass}">\${Icons.MagicWand('w-20 h-20 drop-shadow-sm')}</div><div class="absolute right-0 bottom-0 transition-all duration-500 \${unicornClass}">\${Icons.Unicorn('w-20 h-20 drop-shadow-sm')}</div><div class="w-full px-12 z-20">\${feedbackHtml}</div></div></div><div class="w-full bg-white/60 backdrop-blur-xl border-t border-white/50 p-4 pb-8 shrink-0 rounded-t-[30px] z-20"><div class="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">\${buttonsHtml}</div></div></div>\`;
        };
        const renderApp = () => {
            let html = '';
            switch(state.gameState) {
                case 'title': html = renderTitle(); break;
                case 'playing': html = renderGame(); break;
                case 'stage_clear': html = renderStageClear(); break;
                case 'all_clear': html = renderAllClear(); break;
            }
            appContainer.innerHTML = html;
        };
        window.startGame = startGame;
        window.nextStage = nextStage;
        window.checkAnswer = checkAnswer;
        renderApp();
    </script>
</body>
</html>
`;


const PRESETS = {
    DEMO: {
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        headerPrompt: DEFAULT_HEADER_PROMPT,
        footerPrompt: DEFAULT_FOOTER_PROMPT,
        qualitySample: DEFAULT_QUALITY_SAMPLE,
    },
    Normal: {
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        headerPrompt: DEFAULT_HEADER_PROMPT,
        footerPrompt: DEFAULT_FOOTER_PROMPT,
        qualitySample: DEFAULT_QUALITY_SAMPLE,
    },
    Flat: {
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        headerPrompt: DEFAULT_HEADER_PROMPT,
        footerPrompt: DEFAULT_FOOTER_PROMPT,
        qualitySample: '',
    },
} as const;

type PresetKey = keyof typeof PRESETS;

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
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isWakarooOpen, setIsWakarooOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('DEMO');

    const handlePresetChange = (key: PresetKey) => {
        setSelectedPreset(key);
        setSystemInstruction(PRESETS[key].systemInstruction);
        setHeaderPrompt(PRESETS[key].headerPrompt);
        setFooterPrompt(PRESETS[key].footerPrompt);
        setQualitySample(PRESETS[key].qualitySample);
    };
    const [selectedType, setSelectedType] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'>('E');
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
        const previousHtml = currentHtml;
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
                    model: {
                        A: 'gemini-3-flash-preview',
                        B: 'gemini-3.1-pro-preview',
                        C: 'gemini-2.5-flash',
                        D: 'gemini-2.5-pro',
                        E: 'claude-sonnet-4-6',
                        F: 'claude-opus-4-6',
                        G: 'claude-sonnet-4-5',
                        H: 'claude-haiku-4-5-20251001',
                    }[selectedType],
                }),
            });

            if (!res.ok || !res.body) {
                setError(`通信エラーが発生しました (${res.status})`);
                setCurrentHtml(previousHtml);
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
            setIsTypeOpen(false);
        } catch (err) {
            const code = err instanceof Response ? ` (${err.status})` : '';
            setError(`通信エラーが発生しました${code}`);
            setCurrentHtml(previousHtml);
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
            <div className="flex flex-col gap-2 px-4 pt-3 pb-4 bg-gray-50 border-t border-gray-200 shrink-0 relative">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 shrink-0">
                        {error}
                    </div>
                )}

                {/* ── Wakaroo設定 トグル ── */}
                <div className="flex items-center justify-between shrink-0">
                    <p className="text-sm font-bold text-blue-600">▼Wakaroo設定：<span className="text-blue-500">{selectedPreset}</span></p>
                    <button
                        onClick={() => setIsWakarooOpen(v => !v)}
                        className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 bg-white active:bg-gray-50 transition-colors"
                    >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isWakarooOpen ? 'rotate-180' : ''}`} />
                        {isWakarooOpen ? '閉じる' : '変更'}
                    </button>
                </div>
                {isWakarooOpen && (
                    <div className="absolute bottom-full left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 py-3 z-20 overflow-y-auto shadow-lg">
                        {/* ── DEBUG エリア ── */}
                        <div className="flex flex-col gap-2 border-2 border-dashed border-gray-300 rounded-2xl p-3">
                    {/* プリセット切り替えスイッチ */}
                    <div className="flex gap-1 bg-gray-200 rounded-xl p-1 shrink-0">
                        {(['DEMO', 'Normal', 'Flat'] as PresetKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => handlePresetChange(key)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    selectedPreset === key
                                        ? 'bg-white text-blue-600 shadow'
                                        : 'text-gray-400'
                                }`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>

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
                                    <span className="font-bold text-gray-600">[送信内容] </span>
                                    {labels.map((label, i) => (
                                        <span key={i}>{i + 1}.{label}{i < labels.length - 1 ? ' ＋ ' : ''}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                        </div>
                    </div>
                )}

                {/* API設定 トグル */}
                <>
                    <div className="flex items-center justify-between shrink-0">
                        <p className="text-sm font-bold text-blue-600">
                            ▼API設定：<span className="text-blue-500">{{
                                A: 'gemini-3-flash-preview',
                                B: 'gemini-3.1-pro-preview',
                                C: 'gemini-2.5-flash',
                                D: 'gemini-2.5-pro',
                                E: 'claude-sonnet-4-6',
                                F: 'claude-opus-4-6',
                                G: 'claude-sonnet-4-5',
                                H: 'claude-haiku-4-5',
                            }[selectedType]}</span>
                        </p>
                        <button
                            onClick={() => setIsTypeOpen(v => !v)}
                            className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 bg-white active:bg-gray-50 transition-colors"
                        >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTypeOpen ? 'rotate-180' : ''}`} />
                            {isTypeOpen ? '閉じる' : '変更'}
                        </button>
                    </div>
                    {isTypeOpen && (
                        <div className="grid grid-cols-2 gap-2 shrink-0">
                            {([
                                { key: 'A', label: 'gemini-3-flash-preview' },
                                { key: 'B', label: 'gemini-3.1-pro-preview' },
                                { key: 'C', label: 'gemini-2.5-flash' },
                                { key: 'D', label: 'gemini-2.5-pro' },
                                { key: 'E', label: 'claude-sonnet-4-6' },
                                { key: 'F', label: 'claude-opus-4-6' },
                                { key: 'G', label: 'claude-sonnet-4-5' },
                                { key: 'H', label: 'claude-haiku-4-5' },
                            ] as const).map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => { setSelectedType(key); setIsTypeOpen(false); }}
                                    className={`py-2 px-3 rounded-xl border-2 text-sm font-bold active:scale-95 transition-transform ${
                                        selectedType === key
                                            ? 'border-blue-500 bg-blue-500 text-white'
                                            : 'border-gray-200 bg-white text-gray-500'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                        <p className="text-sm font-bold text-blue-600 shrink-0 text-center">▼どんなアプリを作りますか？</p>
                </>

                {/* ユーザー入力 */}
                <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={3}
                    placeholder={currentHtml
                        ? '修正の例：選択肢の数を３つにして\n追加機能の例：Lv2を○○のテーマで作って'
                        : '例: 足し算の練習ゲームを作って。カラフルで楽しい雰囲気で。'
                    }
                    className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300 shrink-0"
                />

                {/* 送信ボタン */}
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
                            ベースアプリを作る！
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
