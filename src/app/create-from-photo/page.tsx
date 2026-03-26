'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ImagePlus, RotateCcw, Sparkles, Upload, Wifi, Battery, Signal, ChevronDown } from 'lucide-react';
import PostAppModal from '@/components/PostAppModal';

const USAGE_DELIMITER = '\x00WAKAROO_USAGE\x00';

const DEFAULT_SYSTEM_INSTRUCTION = `あなたは小学生向けの教育用アプリケーションを専門とする、優秀なUI/UXデザイナー兼フロントエンド開発者です。
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

const DEFAULT_HEADER_PROMPT = `添付した漢字テスト問題の画像から、すべての問題データを読み取ってください。
読み取ったデータを元に、後述する【品質参考サンプル】をベースとしたReactアプリケーションのコードを生成してください。

【データ抽出ルール】

画像内の全問題を読み取り、以下の形式で KANJI_DATA 配列を生成してください。

yomi には「読み（ひらがな）」だけでなく、前後の文脈（送り仮名や修飾語）も含めてください。

kanji には「正解の漢字」と、それに紐づく文脈（送り仮名など）を繋げた文字列を設定してください。

出力データ形式例：
{ id: 1, yomi: "木のえだ", kanji: "木の枝" }

【アプリの生成仕様】
・以下に記載する「品質参考サンプル」のコード構造、UIデザイン、機能（ホーム、修行、クエスト、リザルト）、各種アニメーション、CSSを完全に踏襲してください。
・KANJI_DATA の配列部分のみを、今回画像から抽出したデータに差し替えてください。

▼以下の内容を盛り込んでください`;
const DEFAULT_FOOTER_PROMPT = `【品質参考サンプル】に実装されているゲーム要素（敵のHP、プレイヤーのハート、コンボ表示、画面揺れやダメージエフェクトなどのカスタムCSS）は、子どもたちのモチベーションを維持するために非常に重要です。なるべく盛り込んで実装してください。`;
const DEFAULT_QUALITY_SAMPLE = `## 【品質参考サンプル】
以下は「インタラクションの水準・アニメーション・タッチ操作の実装レベル」の参考例です。
漢字の問題の実内容は一切参考にしないこと。「どう作るか（How）」の品質基準としてのみ使用してください。

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>漢字クエスト</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    /* カスタムCSS (アニメーション用) */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px) rotate(-5deg); }
      75% { transform: translateX(8px) rotate(5deg); }
    }
    .animate-shake { animation: shake 0.4s ease-in-out; }

    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    .animate-float { animation: float 2.5s ease-in-out infinite; }

    @keyframes damage-flash {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(239, 68, 68, 0.4); }
    }
    .animate-damage { animation: damage-flash 0.3s ease-in-out; }

    @keyframes chest-jump {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1) translateY(-10px); }
    }
    .animate-chest { animation: chest-jump 1s ease-in-out infinite; }

    @keyframes confetti-fall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: #fcd34d;
      animation: confetti-fall 3s linear infinite;
    }

    .game-btn {
      transition: all 0.1s;
      border-bottom-width: 6px;
    }
    .game-btn:active:not(:disabled) {
      border-bottom-width: 0px;
      transform: translateY(6px);
    }

    .flip-card-inner {
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }
    .flip-card-front, .flip-card-back {
      backface-visibility: hidden;
    }
    .flip-card-back {
      transform: rotateY(180deg);
    }

    /* カスタムアニメーション用ユーティリティ */
    .animate-spin-slow { animation: spin 3s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 1s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
</head>
<body class="bg-slate-900 font-sans text-gray-800 flex justify-center selection:bg-yellow-200 min-h-screen m-0">

  <!-- Tailwindの動的クラスを確実にロードさせるためのダミー要素 -->
  <div class="hidden bg-green-300 text-green-800 bg-indigo-300 text-indigo-900 bg-purple-300 text-purple-900 bg-slate-300 text-slate-800 bg-orange-300 text-orange-900 bg-red-300 text-red-900 bg-teal-400 text-teal-900 bg-gray-800 text-purple-300 bg-amber-900 bg-slate-900 bg-white"></div>

  <div class="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-hidden" id="app">

    <!-- ==============================================
         ホーム画面
         ============================================== -->
    <div id="screen-home" class="flex flex-col items-center justify-center flex-1 p-6 space-y-10 bg-gradient-to-b from-sky-300 to-sky-100 relative overflow-hidden min-h-screen">
      <!-- 背景の雲 -->
      <div class="absolute top-10 left-4 text-white/50 text-6xl pointer-events-none animate-float" style="animation-duration: 4s;">☁️</div>
      <div class="absolute top-32 right-4 text-white/50 text-8xl pointer-events-none animate-float" style="animation-duration: 6s;">☁️</div>

      <div class="text-center space-y-4 animate-pop z-10">
        <div class="relative inline-block">
          <i data-lucide="swords" class="w-20 h-20 text-yellow-500 absolute -top-10 -left-6 transform -rotate-12 drop-shadow-md"></i>
          <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 drop-shadow-sm tracking-tighter py-2">
            漢字クエスト
          </h1>
          <i data-lucide="crown" class="w-12 h-12 text-yellow-400 absolute -top-8 -right-4 transform rotate-12 drop-shadow-md"></i>
        </div>
        <div class="bg-white/70 backdrop-blur-md px-6 py-2 rounded-full inline-block shadow-sm border border-white/50">
          <p class="text-blue-800 font-bold text-sm">〜 3学期の試練 (全50問) 〜</p>
        </div>
      </div>

      <div class="w-full max-w-xs space-y-5 mt-8 z-10">
        <button onclick="startQuest()" class="game-btn w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-400 border-red-700 text-white p-5 rounded-2xl font-bold text-2xl shadow-xl">
          <i data-lucide="swords" class="w-8 h-8"></i>
          冒険に出る！
        </button>

        <button onclick="startTraining()" class="game-btn w-full flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-400 border-indigo-700 text-white p-5 rounded-2xl font-bold text-xl shadow-xl">
          <i data-lucide="book-open" class="w-6 h-6"></i>
          魔法の書で修行
        </button>
      </div>

      <div class="mt-8 text-center text-sky-800 font-bold text-sm bg-white/40 p-4 rounded-2xl z-10 backdrop-blur-sm border border-white/50">
        <p>正しい漢字の魔法を選んで</p>
        <p>次々と現れるモンスターをたおそう！</p>
        <p class="mt-2 text-xs text-sky-600">※全問クリアで特別な宝箱が…？</p>
      </div>
    </div>

    <!-- ==============================================
         修行モード画面 (暗記カード)
         ============================================== -->
    <div id="screen-training" class="hidden flex-col h-full bg-indigo-950 text-indigo-100 min-h-screen">
      <div class="flex items-center justify-between p-4 bg-black/40 shadow-sm z-10 backdrop-blur-sm border-b border-indigo-900/50">
        <button onclick="showScreen('home')" class="p-2 text-indigo-300 hover:bg-indigo-800/50 rounded-full transition-colors">
          <i data-lucide="home" class="w-6 h-6"></i>
        </button>
        <div class="flex items-center gap-2">
          <i data-lucide="book-open" class="w-5 h-5 text-indigo-400"></i>
          <span class="font-bold text-indigo-200 tracking-widest">魔法の書</span>
        </div>
        <span id="training-progress" class="font-bold text-indigo-400 text-sm bg-black/30 px-3 py-1 rounded-full">1 / 50</span>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center p-6 w-full relative overflow-hidden">
        <!-- 背景の装飾 -->
        <div class="absolute top-10 left-10 text-indigo-800/20 text-9xl rotate-12 pointer-events-none">✺</div>
        <div class="absolute bottom-10 right-10 text-indigo-800/20 text-9xl -rotate-12 pointer-events-none">✧</div>

        <!-- カード部分 -->
        <div class="w-full h-[26rem] cursor-pointer relative z-10" style="perspective: 1200px;" onclick="flipCard()">
          <div id="training-flip-inner" class="w-full h-full relative flip-card-inner" style="transform: rotateY(0deg);">
            <!-- 表面（読み） -->
            <div class="flip-card-front absolute w-full h-full flex flex-col items-center justify-center bg-[#f0ebd8] rounded-lg shadow-2xl border-8 border-[#c9b793] p-6 text-center">
              <div class="absolute top-4 left-4 text-[#a39471]">❖</div>
              <div class="absolute top-4 right-4 text-[#a39471]">❖</div>
              <div class="absolute bottom-4 left-4 text-[#a39471]">❖</div>
              <div class="absolute bottom-4 right-4 text-[#a39471]">❖</div>
              <span id="training-id" class="text-[#8c7a53] text-sm font-bold absolute top-10 tracking-widest border-b border-[#8c7a53] pb-1">第 1 の呪文</span>
              <span id="training-yomi" class="text-5xl font-extrabold text-[#3e3219] leading-tight" style="writing-mode: vertical-rl;">
                木のえだ
              </span>
              <span class="absolute bottom-10 text-xs text-[#b8a782] font-bold animate-pulse bg-white/50 px-4 py-1 rounded-full">タップして解読</span>
            </div>
            <!-- 裏面（漢字） -->
            <div class="flip-card-back absolute w-full h-full flex flex-col items-center justify-center bg-[#251f33] rounded-lg shadow-2xl border-8 border-[#6b5894] p-6 text-center">
              <div class="absolute top-4 left-4 text-[#6b5894]">✧</div>
              <div class="absolute top-4 right-4 text-[#6b5894]">✧</div>
              <div class="absolute bottom-4 left-4 text-[#6b5894]">✧</div>
              <div class="absolute bottom-4 right-4 text-[#6b5894]">✧</div>
              <span class="text-[#9d8bb8] text-sm font-bold absolute top-10 tracking-widest border-b border-[#9d8bb8] pb-1">真の姿</span>
              <span id="training-kanji" class="text-[5.5rem] font-extrabold text-white leading-tight filter drop-shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                木の枝
              </span>
            </div>
          </div>
        </div>

        <!-- コントロール -->
        <div class="flex justify-between w-full max-w-xs mt-12 z-10">
          <button onclick="prevCard()" class="w-16 h-16 flex items-center justify-center bg-indigo-800 text-indigo-100 rounded-full shadow-lg border-b-4 border-indigo-950 hover:bg-indigo-700 active:border-b-0 active:translate-y-1 transition-all">
            <i data-lucide="arrow-left" class="w-8 h-8"></i>
          </button>
          <button onclick="nextCard()" class="w-16 h-16 flex items-center justify-center bg-indigo-800 text-indigo-100 rounded-full shadow-lg border-b-4 border-indigo-950 hover:bg-indigo-700 active:border-b-0 active:translate-y-1 transition-all">
            <i data-lucide="arrow-right" class="w-8 h-8"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ==============================================
         クエストモード画面
         ============================================== -->
    <div id="screen-quest" class="hidden flex-col h-full relative min-h-screen transition-colors duration-1000">

      <!-- トップヘッダー -->
      <div class="flex items-center justify-between p-4 bg-black/30 text-white z-10 backdrop-blur-sm">
        <button onclick="showScreen('home')" class="p-2 hover:bg-black/40 rounded-full transition-colors">
          <i data-lucide="home" class="w-6 h-6"></i>
        </button>
        <div class="flex items-center gap-2 font-bold text-lg">
          <span>討伐数: <span id="quest-score" class="text-yellow-300 text-xl">0</span></span>
        </div>
        <div id="quest-progress" class="font-bold text-sm bg-black/40 px-3 py-1 rounded-full border border-white/20 shadow-inner">
          問題 1/50
        </div>
      </div>

      <!-- バトルエリア -->
      <div class="flex-1 flex flex-col items-center justify-center relative p-6">
        <!-- コンボ表示 -->
        <div id="quest-combo-container"></div>

        <!-- 敵キャラクター -->
        <div class="relative mb-8 mt-4" id="quest-enemy-emoji">
          <!-- JSで描画 -->
        </div>

        <!-- 敵HPバー -->
        <div id="quest-enemy-hp-container" class="w-48 h-4 bg-black/40 rounded-full overflow-hidden border-2 border-white/30 mb-2 shadow-inner transition-opacity">
          <div id="quest-enemy-hp-fill" class="h-full bg-red-500 transition-all duration-300 ease-out" style="width: 100%"></div>
        </div>
        <div id="quest-enemy-name" class="text-sm font-bold bg-white/70 backdrop-blur-sm px-4 py-1 rounded-full shadow-md border border-white/50">
          敵の名前
        </div>
      </div>

      <!-- プレイヤー情報と問題 -->
      <div class="bg-white/95 backdrop-blur-md rounded-t-[2rem] shadow-[0_-10px_25px_rgba(0,0,0,0.15)] p-5 z-20 pb-8 border-t-4 border-white">

        <div class="flex justify-between items-center mb-5">
          <div id="quest-hearts" class="flex gap-1 bg-slate-100 p-2 rounded-full border border-slate-200">
            <!-- JSでハートを描画 -->
          </div>
          <div class="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            あなたのHP
          </div>
        </div>

        <div class="text-center mb-6">
          <p class="text-sm text-sky-600 font-bold mb-1 tracking-widest">よみを漢字の魔法に変えろ！</p>
          <h2 id="quest-yomi" class="text-3xl font-extrabold text-slate-800 tracking-wider py-2">
            問題文
          </h2>
        </div>

        <!-- 選択肢 -->
        <div id="quest-options" class="grid grid-cols-2 gap-3">
          <!-- JSでボタンを描画 -->
        </div>
      </div>
    </div>

    <!-- ==============================================
         リザルト画面
         ============================================== -->
    <div id="screen-result" class="hidden">
      <!-- JSで動的に中身を生成 -->
    </div>

  </div>

  <!-- ==============================================
       JavaScript ロジック
       ============================================== -->
  <script>
    // --- データ定義 ---
    const KANJI_DATA = [
      { id: 1, prefix: "木の", target: "えだ", suffix: "", correct: "枝", dummies: ["技", "岐", "抜"] },
      { id: 2, prefix: "", target: "ぜいきん", suffix: "", correct: "税金", dummies: ["脱金", "説金", "鋭金"] },
      { id: 3, prefix: "", target: "ふたたび", suffix: "", correct: "再び", dummies: ["度び", "復び", "更び"] },
      { id: 4, prefix: "", target: "てっこう", suffix: "石", correct: "鉄鉱", dummies: ["鉄鋼", "鉄工", "鉄構"] },
      { id: 5, prefix: "", target: "まずしい", suffix: "", correct: "貧しい", dummies: ["貪しい", "盆しい", "負しい"] },
      { id: 6, prefix: "馬の", target: "しいく", suffix: "", correct: "飼育", dummies: ["飼生", "詞育", "飼行"] },
      { id: 7, prefix: "", target: "こな", suffix: "をまく", correct: "粉", dummies: ["粒", "粘", "紛"] },
      { id: 8, prefix: "", target: "ふじん", suffix: "服", correct: "婦人", dummies: ["婦任", "掃人", "帰人"] },
      { id: 9, prefix: "", target: "はんざい", suffix: "", correct: "犯罪", dummies: ["犯財", "犯材", "犯在"] },
      { id: 10, prefix: "", target: "ひじょう", suffix: "口", correct: "非常", dummies: ["非情", "非乗", "非定"] },
      { id: 11, prefix: "新しい", target: "せいど", suffix: "", correct: "制度", dummies: ["製度", "政度", "星度"] },
      { id: 12, prefix: "テストの", target: "へいきん", suffix: "", correct: "平均", dummies: ["平近", "平金", "平琴"] },
      { id: 13, prefix: "国と国の", target: "きょう", suffix: "界", correct: "境", dummies: ["鏡", "競", "橋"] },
      { id: 14, prefix: "", target: "はそん", suffix: "する", correct: "破損", dummies: ["破村", "波損", "破尊"] },
      { id: 15, prefix: "", target: "せい力", suffix: "的", correct: "勢力", dummies: ["精力", "製力", "政力"] },
      { id: 16, prefix: "", target: "たいど", suffix: "", correct: "態度", dummies: ["熊度", "態土", "能度"] },
      { id: 17, prefix: "", target: "かり", suffix: "入部", correct: "仮", dummies: ["反", "返", "坂"] },
      { id: 18, prefix: "", target: "ゆ", suffix: "出品", correct: "輸", dummies: ["輪", "論", "諭"] },
      { id: 19, prefix: "", target: "ゆた", suffix: "かな心", correct: "豊", dummies: ["曲", "豆", "登"] },
      { id: 20, prefix: "公園の", target: "しゅうい", suffix: "", correct: "周囲", dummies: ["週囲", "修囲", "終囲"] },
      { id: 21, prefix: "", target: "ぼう", suffix: "風雨", correct: "暴", dummies: ["防", "爆", "冒"] },
      { id: 22, prefix: "", target: "じ務", suffix: "仕事", correct: "事務", dummies: ["字務", "自務", "辞務"] },
      { id: 23, prefix: "映画に", target: "出えん", suffix: "", correct: "出演", dummies: ["出遠", "出園", "出炎"] },
      { id: 24, prefix: "席を", target: "うつ", suffix: "る", correct: "移", dummies: ["写", "映", "秒"] },
      { id: 25, prefix: "伝", target: "ごん", suffix: "板", correct: "言", dummies: ["信", "語", "事"] },
      { id: 26, prefix: "", target: "あつ", suffix: "力", correct: "圧", dummies: ["厚", "熱", "庄"] },
      { id: 27, prefix: "", target: "せい", suffix: "義感", correct: "正", dummies: ["政", "性", "整"] },
      { id: 28, prefix: "", target: "はん", suffix: "画の作品", correct: "版", dummies: ["板", "判", "半"] },
      { id: 29, prefix: "友達を", target: "すく", suffix: "う", correct: "救", dummies: ["求", "球", "吸"] },
      { id: 30, prefix: "", target: "ぼうさい", suffix: "訓練", correct: "防災", dummies: ["暴災", "防才", "防済"] },
      { id: 31, prefix: "", target: "えいえん", suffix: "の命", correct: "永遠", dummies: ["泳遠", "栄遠", "永演"] },
      { id: 32, prefix: "船が", target: "出こう", suffix: "する", correct: "出航", dummies: ["出港", "出降", "出抗"] },
      { id: 33, prefix: "", target: "えい", suffix: "生面", correct: "衛", dummies: ["栄", "英", "営"] },
      { id: 34, prefix: "畑を", target: "たがや", suffix: "す", correct: "耕", dummies: ["講", "構", "耗"] },
      { id: 35, prefix: "", target: "せい", suffix: "別を聞く", correct: "性", dummies: ["正", "生", "政"] },
      { id: 36, prefix: "", target: "へんしゅう", suffix: "作業", correct: "編集", dummies: ["偏集", "編修", "返集"] },
      { id: 37, prefix: "生活", target: "しゅうかん", suffix: "", correct: "習慣", dummies: ["週刊", "習換", "集観"] },
      { id: 38, prefix: "算数の", target: "きょうし", suffix: "", correct: "教師", dummies: ["教士", "教室", "教史"] },
      { id: 39, prefix: "息を", target: "ころ", suffix: "す", correct: "殺", dummies: ["死", "設", "没"] },
      { id: 40, prefix: "兄の", target: "せいかく", suffix: "", correct: "性格", dummies: ["正格", "性角", "生格"] },
      { id: 41, prefix: "", target: "しょく", suffix: "員室", correct: "職", dummies: ["食", "植", "色"] },
      { id: 42, prefix: "新", target: "せい", suffix: "品", correct: "製", dummies: ["性", "政", "正"] },
      { id: 43, prefix: "広い", target: "居ま", suffix: "", correct: "居間", dummies: ["居真", "居魔", "居満"] },
      { id: 44, prefix: "意見を", target: "のべ", suffix: "る", correct: "述", dummies: ["延", "建", "連"] },
      { id: 45, prefix: "大学", target: "きょうじゅ", suffix: "", correct: "教授", dummies: ["教受", "教樹", "教需"] },
      { id: 46, prefix: "", target: "きそ", suffix: "", correct: "基礎", dummies: ["基楚", "期礎", "木礎"] },
      { id: 47, prefix: "", target: "ぞうか", suffix: "", correct: "増加", dummies: ["増化", "造加", "蔵加"] },
      { id: 48, prefix: "", target: "せつび", suffix: "", correct: "設備", dummies: ["設美", "説備", "接備"] },
      { id: 49, prefix: "", target: "さん", suffix: "性", correct: "酸", dummies: ["賛", "算", "散"] },
      { id: 50, prefix: "", target: "ていじ", suffix: "", correct: "提示", dummies: ["提時", "定示", "底示"] }
    ];

    const ENEMIES = [
      { emoji: '🍄', name: 'キノコくん', hp: 2, bg: 'bg-green-300', color: 'text-green-800' },
      { emoji: '🦇', name: 'バットくん', hp: 3, bg: 'bg-indigo-300', color: 'text-indigo-900' },
      { emoji: '👻', name: 'ゴースト', hp: 3, bg: 'bg-purple-300', color: 'text-purple-900' },
      { emoji: '🐺', name: 'ウルフ', hp: 4, bg: 'bg-slate-300', color: 'text-slate-800' },
      { emoji: '🦍', name: 'マッスルゴリラ', hp: 5, bg: 'bg-orange-300', color: 'text-orange-900' },
      { emoji: '🦖', name: 'ダイナソー', hp: 5, bg: 'bg-red-300', color: 'text-red-900' },
      { emoji: '🐉', name: 'ドラゴン', hp: 6, bg: 'bg-teal-400', color: 'text-teal-900' },
      { emoji: '👿', name: 'まおう', hp: 10, bg: 'bg-gray-800', color: 'text-purple-300' },
    ];

    const HEART_FULL = \`<svg class="w-7 h-7 fill-red-500 text-red-600 animate-pop transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>\`;
    const HEART_EMPTY = \`<svg class="w-7 h-7 fill-gray-200 text-gray-300 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>\`;

    const MAX_HP = 4;

    let state = {
      currentScreen: 'home',
      training: { currentIndex: 0, isFlipped: false },
      quest: {
        questions: [], currentQIndex: 0, options: [], playerHp: MAX_HP,
        enemyIndex: 0, enemyHp: 0, maxEnemyHp: 0, combo: 0, score: 0,
        totalCorrect: 0, feedback: null, selectedOptionId: null
      },
      result: { totalCorrect: 0, score: 0, isClear: false, phase: 'result' }
    };

    lucide.createIcons();

    function showScreen(screenId) {
      ['home','training','quest','result'].forEach(id => {
        document.getElementById('screen-' + id).classList.add('hidden');
      });
      document.getElementById('screen-' + screenId).classList.remove('hidden');
      state.currentScreen = screenId;
    }

    function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

    function startTraining() {
      state.training.currentIndex = 0;
      state.training.isFlipped = false;
      renderTraining();
      showScreen('training');
    }

    function renderTraining() {
      const ts = state.training;
      const kanji = KANJI_DATA[ts.currentIndex];
      document.getElementById('training-progress').innerText = \`\${ts.currentIndex + 1} / 50\`;
      document.getElementById('training-id').innerText = \`第 \${kanji.id} の呪文\`;
      document.getElementById('training-yomi').innerHTML =
        \`\${kanji.prefix}<span class="text-red-700 font-black">\${kanji.target}</span>\${kanji.suffix}\`;
      document.getElementById('training-kanji').innerHTML =
        \`\${kanji.prefix}<span class="text-yellow-300 font-black">\${kanji.correct}</span>\${kanji.suffix}\`;
      document.getElementById('training-flip-inner').style.transform = ts.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }

    function flipCard() { state.training.isFlipped = !state.training.isFlipped; renderTraining(); }

    function nextCard() {
      state.training.isFlipped = false; renderTraining();
      setTimeout(() => { state.training.currentIndex = (state.training.currentIndex + 1) % KANJI_DATA.length; renderTraining(); }, 200);
    }

    function prevCard() {
      state.training.isFlipped = false; renderTraining();
      setTimeout(() => { state.training.currentIndex = (state.training.currentIndex - 1 + KANJI_DATA.length) % KANJI_DATA.length; renderTraining(); }, 200);
    }

    function startQuest() {
      const q = state.quest;
      q.questions = shuffle([...KANJI_DATA]);
      q.currentQIndex = 0; q.playerHp = MAX_HP; q.enemyIndex = 0;
      q.combo = 0; q.score = 0; q.totalCorrect = 0; q.feedback = null; q.selectedOptionId = null;
      q.enemyHp = ENEMIES[0].hp; q.maxEnemyHp = ENEMIES[0].hp;
      setupOptions(); showScreen('quest'); renderQuest();
    }

    function setupOptions() {
      const q = state.quest;
      const cq = q.questions[q.currentQIndex];
      q.options = shuffle([
        { id: 'correct', text: cq.correct },
        { id: 'dummy1', text: cq.dummies[0] },
        { id: 'dummy2', text: cq.dummies[1] },
        { id: 'dummy3', text: cq.dummies[2] }
      ]);
    }

    function handleAnswer(optId) {
      const q = state.quest;
      if (q.feedback) return;
      q.selectedOptionId = optId;
      const isCorrect = optId === 'correct';
      if (isCorrect) {
        q.feedback = 'correct'; q.combo++; q.totalCorrect++; q.enemyHp--;
        renderQuest();
        if (q.enemyHp <= 0) {
          setTimeout(() => {
            q.feedback = 'defeat'; q.score++; renderQuest();
            setTimeout(() => {
              q.enemyIndex = (q.enemyIndex + 1) % ENEMIES.length;
              q.enemyHp = ENEMIES[q.enemyIndex].hp; q.maxEnemyHp = ENEMIES[q.enemyIndex].hp;
              nextQuestion();
            }, 800);
          }, 400);
        } else { setTimeout(nextQuestion, 800); }
      } else {
        q.feedback = 'wrong'; q.combo = 0; q.playerHp--; renderQuest();
        if (q.playerHp <= 0) { setTimeout(() => finishQuest(false), 1200); }
        else { setTimeout(nextQuestion, 1000); }
      }
    }

    function nextQuestion() {
      const q = state.quest;
      q.feedback = null; q.selectedOptionId = null; q.currentQIndex++;
      if (q.currentQIndex >= q.questions.length) { finishQuest(true); }
      else { setupOptions(); renderQuest(); }
    }

    function finishQuest(isClear) {
      const q = state.quest;
      state.result.totalCorrect = isClear ? q.totalCorrect + 1 : q.totalCorrect;
      state.result.score = isClear ? q.score + (q.enemyHp <= 1 ? 1 : 0) : q.score;
      state.result.isClear = isClear;
      state.result.phase = isClear ? 'chest' : 'result';
      showScreen('result'); renderResult();
    }

    function renderQuest() {
      const q = state.quest;
      if (q.questions.length === 0) return;
      const enemy = ENEMIES[q.enemyIndex];
      const cq = q.questions[q.currentQIndex];
      const sq = document.getElementById('screen-quest');
      sq.className = \`flex flex-col h-full relative min-h-screen transition-colors duration-1000 \${q.feedback === 'wrong' ? 'animate-damage' : ''} \${enemy.bg}\`;
      document.getElementById('quest-score').innerText = q.score;
      document.getElementById('quest-progress').innerText = \`問題 \${q.currentQIndex + 1}/50\`;
      const combo = document.getElementById('quest-combo-container');
      combo.innerHTML = (q.combo > 1 && !q.feedback)
        ? \`<div class="absolute top-4 left-4 animate-pop z-20"><span class="text-3xl font-black text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] italic">\${q.combo} COMBO!</span></div>\`
        : '';
      const emojiAnim = q.feedback === 'correct' ? 'animate-shake' : 'animate-float';
      const emojiOp = q.feedback === 'defeat' ? 'opacity-0 scale-50 transition-all duration-500' : 'opacity-100';
      let fx = '';
      if (q.feedback === 'correct') fx = \`<div class="absolute inset-0 flex items-center justify-center text-7xl animate-pop pointer-events-none">💥</div>\`;
      if (q.feedback === 'defeat') fx = \`<div class="absolute inset-0 flex items-center justify-center text-7xl animate-pop pointer-events-none">✨💨</div>\`;
      document.getElementById('quest-enemy-emoji').innerHTML = \`<div class="text-9xl filter drop-shadow-xl \${emojiAnim} \${emojiOp}">\${enemy.emoji}</div>\${fx}\`;
      const hpBar = document.getElementById('quest-enemy-hp-container');
      hpBar.className = \`w-48 h-4 bg-black/40 rounded-full overflow-hidden border-2 border-white/30 mb-2 shadow-inner transition-opacity \${q.feedback === 'defeat' ? 'opacity-0' : 'opacity-100'}\`;
      document.getElementById('quest-enemy-hp-fill').style.width = \`\${(q.enemyHp / q.maxEnemyHp) * 100}%\`;
      const nameEl = document.getElementById('quest-enemy-name');
      nameEl.className = \`text-sm font-bold \${enemy.color} bg-white/70 backdrop-blur-sm px-4 py-1 rounded-full shadow-md border border-white/50\`;
      nameEl.innerText = enemy.name;
      const hearts = document.getElementById('quest-hearts');
      hearts.innerHTML = '';
      for (let i = 0; i < MAX_HP; i++) hearts.innerHTML += i < q.playerHp ? HEART_FULL : HEART_EMPTY;
      document.getElementById('quest-yomi').innerHTML =
        \`\${cq.prefix}<span class="text-sky-600 underline decoration-sky-400 decoration-4 underline-offset-4 mx-1">\${cq.target}</span>\${cq.suffix}\`;
      const opts = document.getElementById('quest-options');
      opts.innerHTML = '';
      q.options.forEach(opt => {
        let cls = "bg-white border-slate-200 text-slate-700 hover:bg-sky-50 shadow-sm";
        if (q.feedback && q.selectedOptionId) {
          if (opt.id === 'correct') cls = "bg-emerald-500 border-emerald-700 text-white scale-105 z-10 shadow-lg";
          else if (opt.id === q.selectedOptionId) cls = "bg-rose-500 border-rose-700 text-white opacity-80";
          else cls = "bg-slate-100 border-slate-200 text-slate-400 opacity-50";
        }
        const btn = document.createElement('button');
        btn.className = \`game-btn py-4 px-2 rounded-2xl font-bold text-2xl md:text-3xl tracking-widest \${cls}\`;
        btn.innerText = opt.text;
        btn.disabled = !!q.feedback;
        btn.onclick = () => handleAnswer(opt.id);
        opts.appendChild(btn);
      });
    }

    function openChest() {
      state.result.phase = 'opening'; renderResult();
      setTimeout(() => { state.result.phase = 'result'; renderResult(); }, 1500);
    }

    function renderResult() {
      const r = state.result;
      const el = document.getElementById('screen-result');
      if (r.phase === 'chest') {
        el.className = \`flex flex-col items-center justify-center flex-1 p-6 space-y-8 relative overflow-hidden min-h-screen bg-slate-900\`;
        el.innerHTML = \`<div class="flex flex-col items-center justify-center w-full space-y-8 text-white z-10">
          <h2 class="text-3xl font-bold text-yellow-400 animate-pulse tracking-widest">全問クリア！！</h2>
          <p class="text-lg text-slate-300">すごい！最後まで生き残った！</p>
          <div class="mt-10 cursor-pointer animate-chest" onclick="openChest()"><div class="text-9xl">🎁</div></div>
          <p class="mt-8 font-bold text-yellow-300 animate-bounce bg-yellow-900/50 px-6 py-2 rounded-full border border-yellow-500/50">タップして宝箱を開ける！</p>
        </div>\`;
      } else if (r.phase === 'opening') {
        el.className = \`flex flex-col items-center justify-center flex-1 min-h-screen bg-white\`;
        el.innerHTML = \`<div class="flex items-center justify-center w-full"><i data-lucide="sparkles" class="w-32 h-32 text-yellow-400 animate-spin-slow"></i></div>\`;
        lucide.createIcons();
      } else {
        el.className = \`flex flex-col items-center justify-center flex-1 p-6 space-y-8 relative overflow-hidden min-h-screen \${r.isClear ? 'bg-amber-900' : 'bg-slate-900'}\`;
        let rank = {};
        if (r.isClear && r.totalCorrect >= 45) rank = { title:"伝説の漢字勇者", desc:"おめでとう！君は真のマスターだ！", color:"text-yellow-500", bg:"bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-400", icon:"crown", iconColor:"text-yellow-500" };
        else if (r.isClear) rank = { title:"熟練の魔法剣士", desc:"最後までクリア！すばらしい力だ！", color:"text-blue-500", bg:"bg-slate-50 border-blue-300", icon:"swords", iconColor:"text-blue-500" };
        else if (r.totalCorrect >= 25) rank = { title:"一人前の冒険者", desc:"なかなかやるね！次はクリアだ！", color:"text-emerald-500", bg:"bg-slate-50 border-slate-300", icon:"trophy", iconColor:"text-emerald-500" };
        else rank = { title:"かけだしの戦士", desc:"魔法の書で修行しよう！", color:"text-orange-500", bg:"bg-slate-50 border-slate-300", icon:"zap", iconColor:"text-orange-500" };
        const confettiHtml = r.isClear ? \`<div id="confetti-container" class="absolute inset-0 overflow-hidden pointer-events-none z-0"></div>\` : '';
        el.innerHTML = \`\${confettiHtml}
          <div class="w-full max-w-sm p-8 rounded-[2rem] shadow-2xl text-center relative z-10 border-4 \${rank.bg} animate-pop">
            \${r.isClear ? \`<div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-900 font-black px-6 py-1 rounded-full border-2 border-white shadow-lg whitespace-nowrap">GAME CLEAR!</div>\` : ''}
            <h2 class="text-xl font-bold text-slate-500 mb-6 border-b-2 border-slate-200/50 pb-2 mt-2">冒険のきろく</h2>
            <div class="flex justify-center mb-4 animate-float"><i data-lucide="\${rank.icon}" class="w-24 h-24 \${rank.iconColor}"></i></div>
            <h3 class="text-3xl font-black \${rank.color} mb-2 tracking-tight">\${rank.title}</h3>
            <p class="text-slate-600 font-bold text-sm mb-8">\${rank.desc}</p>
            <div class="space-y-4 text-left bg-white/60 p-5 rounded-2xl border border-slate-200 shadow-inner">
              <div class="flex justify-between items-center">
                <span class="text-slate-600 font-bold flex items-center gap-2"><i data-lucide="sparkles" class="w-4 h-4 text-yellow-500"></i>正解した問題</span>
                <span class="text-3xl font-black text-slate-800">\${r.totalCorrect} <span class="text-sm text-slate-500">/ 50</span></span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-600 font-bold flex items-center gap-2"><i data-lucide="swords" class="w-4 h-4 text-red-500"></i>たおした敵</span>
                <span class="text-3xl font-black text-slate-800">\${r.score} <span class="text-sm text-slate-500">匹</span></span>
              </div>
            </div>
          </div>
          <div class="w-full max-w-sm space-y-4 z-10 mt-6">
            <button onclick="startQuest()" class="game-btn w-full p-4 rounded-2xl font-bold text-xl bg-yellow-400 border-yellow-600 text-yellow-900 shadow-xl flex items-center justify-center gap-2">
              <i data-lucide="swords" class="w-6 h-6"></i> もういちど冒険へ
            </button>
            <button onclick="showScreen('home')" class="game-btn w-full p-4 rounded-2xl font-bold text-xl bg-slate-700 border-slate-900 text-white shadow-xl flex items-center justify-center gap-2">
              <i data-lucide="home" class="w-6 h-6"></i> 村へ帰る
            </button>
          </div>\`;
        lucide.createIcons();
        if (r.isClear) {
          const c = document.getElementById('confetti-container');
          const colors = ['#fcd34d','#f87171','#60a5fa','#34d399','#c084fc'];
          for (let i = 0; i < 40; i++) {
            const d = document.createElement('div');
            d.className = 'confetti';
            d.style.left = \`\${Math.random() * 100}%\`;
            d.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            d.style.animationDuration = \`\${Math.random() * 2 + 2}s\`;
            d.style.animationDelay = \`\${Math.random() * 2}s\`;
            c.appendChild(d);
          }
        }
      }
    }
  </script>
</body>
</html>
`;


const PRESETS = {
    DEMO:   { systemInstruction: DEFAULT_SYSTEM_INSTRUCTION, headerPrompt: DEFAULT_HEADER_PROMPT, footerPrompt: DEFAULT_FOOTER_PROMPT, qualitySample: DEFAULT_QUALITY_SAMPLE },
    Normal: { systemInstruction: DEFAULT_SYSTEM_INSTRUCTION, headerPrompt: DEFAULT_HEADER_PROMPT, footerPrompt: DEFAULT_FOOTER_PROMPT, qualitySample: DEFAULT_QUALITY_SAMPLE },
    Flat:   { systemInstruction: DEFAULT_SYSTEM_INSTRUCTION, headerPrompt: DEFAULT_HEADER_PROMPT, footerPrompt: DEFAULT_FOOTER_PROMPT, qualitySample: DEFAULT_QUALITY_SAMPLE },
} as const;

type PresetKey = keyof typeof PRESETS;

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

export default function CreateFromPhotoPage() {
    const router = useRouter();

    // Step 1: 設定フォーム
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');

    // Wakaroo設定
    const [isWakarooOpen, setIsWakarooOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('DEMO');
    const [systemInstruction, setSystemInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);
    const [headerPrompt, setHeaderPrompt] = useState(DEFAULT_HEADER_PROMPT);
    const [footerPrompt, setFooterPrompt] = useState(DEFAULT_FOOTER_PROMPT);
    const [qualitySample, setQualitySample] = useState(DEFAULT_QUALITY_SAMPLE);
    const handlePresetChange = (key: PresetKey) => {
        setSelectedPreset(key);
        setSystemInstruction(PRESETS[key].systemInstruction);
        setHeaderPrompt(PRESETS[key].headerPrompt);
        setFooterPrompt(PRESETS[key].footerPrompt);
        setQualitySample(PRESETS[key].qualitySample);
    };

    // API設定
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'>('E');

    // Step 2: 生成フロー
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [currentHtml, setCurrentHtml] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [revisionPrompt, setRevisionPrompt] = useState('');
    const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number | null; candidatesTokens: number | null; totalTokens: number | null } | null>(null);

    // フォン mockup スケール
    const [iframeScale, setIframeScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(600);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const iframeContainerRef = useCallback((el: HTMLDivElement | null) => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
        }
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setIframeScale(width / 375);
            setContainerHeight(height);
        });
        observer.observe(el);
        resizeObserverRef.current = observer;
    }, []);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => setPhotoPreview(event.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        setPhotoPreview(null);
        setPrompt('');
        setCurrentHtml('');
        setStreamingText('');
        setError(null);
        setRevisionPrompt('');
        setTokenUsage(null);
    };

    const handleRevise = async () => {
        if (!revisionPrompt.trim() || !currentHtml) return;

        const prevHtml = currentHtml;
        setIsStreaming(true);
        setStreamingText('');
        setCurrentHtml('');
        setError(null);

        let accumulated = '';

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction,
                    headerPrompt: '',
                    footerPrompt,
                    userPrompt: revisionPrompt,
                    currentHtml: prevHtml,
                    qualitySample: '',
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
                setCurrentHtml(prevHtml);
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
                    try { setTokenUsage(JSON.parse(accumulated.slice(delimIdx + USAGE_DELIMITER.length).trim())); } catch { /* ignore */ }
                    accumulated = accumulated.slice(0, delimIdx);
                    setStreamingText(accumulated);
                    break;
                }

                setStreamingText(accumulated);
            }

            setCurrentHtml(extractHtml(accumulated));
            setRevisionPrompt('');
        } catch {
            setError('通信エラーが発生しました');
            setCurrentHtml(prevHtml);
        } finally {
            setIsStreaming(false);
        }
    };

    const isReady = !!photoPreview;
    const isGenerating = isStreaming || !!currentHtml || !!error;

    // 画像を最大1024pxにリサイズしてJPEG圧縮する
    const resizeImage = (dataUrl: string): Promise<{ base64: string; mimeType: string }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const MAX = 1024;
                const scale = Math.min(1, MAX / Math.max(img.width, img.height));
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.85);
                const base64 = compressed.split(',')[1];
                resolve({ base64, mimeType: 'image/jpeg' });
            };
            img.src = dataUrl;
        });
    };

    const handleGenerate = async () => {
        if (!photoPreview) return;

        setIsStreaming(true);
        setStreamingText('');
        setCurrentHtml('');
        setError(null);

        let accumulated = '';

        try {
            // 画像を圧縮してからAPIに送る（大きい写真でもハングしないように）
            const { base64: photoBase64, mimeType } = await resizeImage(photoPreview);

            const res = await fetch('/api/generate-from-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    photoBase64,
                    mimeType,
                    prompt,
                    systemInstruction,
                    headerPrompt,
                    footerPrompt,
                    qualitySample,
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
                    try { setTokenUsage(JSON.parse(accumulated.slice(delimIdx + USAGE_DELIMITER.length).trim())); } catch { /* ignore */ }
                    accumulated = accumulated.slice(0, delimIdx);
                    setStreamingText(accumulated);
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

    // 生成後の画面
    if (isGenerating) {
        return (
            <>
                <PostAppModal
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    onSuccess={() => router.push('/?category=test')}
                    initialHtmlCode={currentHtml}
                    initialCategory="test"
                />
                <div className="flex flex-col h-[100dvh] bg-gray-200">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 text-gray-500 active:text-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                            <span className="text-sm">やり直す</span>
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

                    {/* スマホモックアップ */}
                    <div
                        className="flex-1 min-h-0 flex items-center justify-center py-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/bg-main.png')", minHeight: 0 }}
                    >
                        <div className="h-[97%] max-h-full aspect-[9/16] bg-black border-[12px] border-black rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
                            {/* ステータスバー */}
                            <div className="absolute top-0 left-0 right-0 h-5 bg-white z-10 flex items-center px-3">
                                <span className="text-[10px] font-bold text-black">12:34</span>
                                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-5 bg-black rounded-b-2xl flex items-center justify-center">
                                    <div className="w-8 h-1.5 bg-gray-700 rounded-full" />
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <Signal className="w-3 h-3 text-black" />
                                    <Wifi className="w-3 h-3 text-black" />
                                    <Battery className="w-3.5 h-3.5 text-black" />
                                </div>
                            </div>
                            {/* コンテンツ */}
                            <div ref={iframeContainerRef} className="flex-1 min-h-0 mt-5 relative overflow-hidden">
                                {isStreaming ? (
                                    <>
                                        <TerminalView text={streamingText} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
                                            <div className="relative w-24 h-24">
                                                <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-orange-300 animate-spin" style={{ animationDuration: '3s' }} />
                                                <div className="absolute inset-2 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" style={{ animationDuration: '0.75s' }} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-11 h-11 bg-orange-50 rounded-full animate-pulse shadow-inner" />
                                                </div>
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
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* 追加の指示 / 修正指示エリア */}
                    {(isStreaming || !!currentHtml) && <div className="shrink-0 bg-white border-t border-gray-100">
                        {/* ストリーミング中：追加の指示を表示 */}
                        {isStreaming && prompt && (
                            <div className="px-4 py-3">
                                <p className="text-xs text-gray-400 font-medium mb-1">追加の指示</p>
                                <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">{prompt}</p>
                            </div>
                        )}
                        {/* 生成完了後：修正指示入力エリア */}
                        {currentHtml && !isStreaming && (
                            <div className="px-4 py-3 flex gap-2 items-end">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 font-medium mb-1">修正の指示</p>
                                    <textarea
                                        value={revisionPrompt}
                                        onChange={(e) => setRevisionPrompt(e.target.value)}
                                        placeholder="例：もっとシンプルにして、色を変えて"
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border-2 border-orange-100 rounded-2xl resize-none focus:outline-none focus:border-orange-400 placeholder-gray-400"
                                    />
                                </div>
                                <button
                                    disabled={!revisionPrompt.trim()}
                                    onClick={handleRevise}
                                    className="mb-0.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold text-sm flex flex-col items-center justify-center gap-1 shadow disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    修正
                                </button>
                            </div>
                        )}
                    </div>}

                    {/* エラー表示 */}
                    {error && (
                        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 shrink-0">
                            {error}
                        </div>
                    )}

                    {/* トークン使用量デバッグ表示 */}
                    {tokenUsage && (
                        <div className="mx-4 mb-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono shrink-0">
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
            </>
        );
    }

    // Step 1: 設定フォーム
    return (
        <div className="fixed inset-0 z-[100] bg-orange-50 flex flex-col">

            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                    <span className="text-sm">キャンセル</span>
                </button>
                <h1 className="text-base font-bold text-gray-700">プリントからアプリを作る</h1>
                <div className="w-20" />
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

                {/* 1. 写真 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                        プリントの写真
                    </label>

                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                    />
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                    />

                    <AnimatePresence mode="wait">
                        {!photoPreview ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col gap-3"
                            >
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                                >
                                    <Camera className="w-5 h-5" />
                                    カメラで撮影する
                                </button>
                                <button
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="w-full py-3 rounded-2xl bg-white border-2 border-orange-100 text-gray-600 font-medium flex items-center justify-center gap-2"
                                >
                                    <ImagePlus className="w-5 h-5" />
                                    ギャラリーから選ぶ
                                </button>
                                <p className="text-xs text-gray-400 text-center pt-1">
                                    テストプリントから学習アプリをつくろう！
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative"
                            >
                                <img
                                    src={photoPreview}
                                    alt="撮影したプリント"
                                    className="w-full rounded-2xl object-cover max-h-64"
                                />
                                <button
                                    onClick={handleReset}
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Wakaroo設定 トグル */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
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
                        <div className="flex flex-col gap-2 border-2 border-dashed border-gray-300 rounded-2xl p-3">
                            <div className="flex gap-1 bg-gray-200 rounded-xl p-1">
                                {(['DEMO', 'Normal', 'Flat'] as PresetKey[]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => handlePresetChange(key)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            selectedPreset === key ? 'bg-white text-blue-600 shadow' : 'text-gray-400'
                                        }`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">システム指示（System Instruction）</label>
                                <textarea
                                    value={systemInstruction}
                                    onChange={(e) => setSystemInstruction(e.target.value)}
                                    rows={2}
                                    className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">ベースプロンプト1（ヘッダー）</label>
                                <textarea
                                    value={headerPrompt}
                                    onChange={(e) => setHeaderPrompt(e.target.value)}
                                    rows={2}
                                    className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">ベースプロンプト2（フッター）</label>
                                <textarea
                                    value={footerPrompt}
                                    onChange={(e) => setFooterPrompt(e.target.value)}
                                    rows={2}
                                    className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">品質参考サンプル <span className="text-gray-300 normal-case font-normal">（初回送信のみ）</span></label>
                                <textarea
                                    value={qualitySample}
                                    onChange={(e) => setQualitySample(e.target.value)}
                                    rows={2}
                                    className="w-full text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* API設定 トグル */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-blue-600">▼API設定：<span className="text-blue-500">{{
                            A: 'gemini-3-flash-preview',
                            B: 'gemini-3.1-pro-preview',
                            C: 'gemini-2.5-flash',
                            D: 'gemini-2.5-pro',
                            E: 'claude-sonnet-4-6',
                            F: 'claude-opus-4-6',
                            G: 'claude-sonnet-4-5',
                            H: 'claude-haiku-4-5',
                        }[selectedType]}</span></p>
                        <button
                            onClick={() => setIsTypeOpen(v => !v)}
                            className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 bg-white active:bg-gray-50 transition-colors"
                        >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTypeOpen ? 'rotate-180' : ''}`} />
                            {isTypeOpen ? '閉じる' : '変更'}
                        </button>
                    </div>
                    {isTypeOpen && (
                        <div className="grid grid-cols-2 gap-2">
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
                                        selectedType === key ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-white text-gray-500'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. アプリの種類 */}
                {/* 2. 追加の指示 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                        追加の指示（任意）
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="例：小学2年生向けに簡単にして"
                        rows={3}
                        className="w-full px-4 py-3 text-sm text-gray-700 bg-white border-2 border-orange-100 rounded-2xl resize-none focus:outline-none focus:border-orange-400 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* フッター */}
            <div className="px-4 py-4 bg-white border-t border-gray-100">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={!isReady}
                    onClick={handleGenerate}
                    className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                        isReady
                            ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Sparkles className="w-5 h-5" />
                    アプリを生成する
                </motion.button>
            </div>
        </div>
    );
}
