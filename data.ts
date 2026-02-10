// ========================================
// data.ts — クライアント向けデータ定義ファイル
// ========================================
// このファイルの配列を編集するだけで、アプリの表示内容が変わります。
// 詳細は README.md を参照してください。

// ========================================
// 型定義
// ========================================

/** カテゴリID */
export type Category = 'baby' | 'infant' | 'low' | 'high';

/** カテゴリ設定 */
export interface CategoryConfig {
    id: Category;
    label: string;
    color: string;
}

/** アプリ（投稿）データ */
export interface AppItem {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;   // 画像パス or プレースホルダー文字（A, B, C ...）
    category: Category;
    tags: string[];
    isRanking: boolean;
    rank: number | null;     // ランキング順位（1〜3）、非ランキングは null
    isFeatured: boolean;     // おすすめフラグ
    appUrl: string;
}

// ========================================
// カテゴリ一覧
// ========================================

export const categories: CategoryConfig[] = [
    { id: 'baby', label: 'ベビー', color: '#EC4899' },
    { id: 'infant', label: '幼児', color: '#F59E0B' },
    { id: 'low', label: '低学年', color: '#F97316' },
    { id: 'high', label: '高学年', color: '#3B82F6' },
];

// ========================================
// ダミーデータ（A / B / C 構造）
// ========================================
// thumbnailUrl に "A", "B", "C" などのアルファベットを指定すると
// プレースホルダー表示になります。
// 実画像に差し替える場合は "/images/xxx.png" 形式で指定してください。

export const apps: AppItem[] = [
    // ── ベビー (baby) ──────────────────────
    // ランキング
    { id: 'baby-1', title: '音と色のあそび', description: 'タッチすると音が鳴る！色と音で感覚を育てる', thumbnailUrl: 'A', category: 'baby', tags: ['感覚'], isRanking: true, rank: 1, isFeatured: true, appUrl: '/apps/sound-color' },
    { id: 'baby-2', title: 'いないいないばあ', description: '赤ちゃんが喜ぶいないいないばあアプリ', thumbnailUrl: 'B', category: 'baby', tags: ['あそび'], isRanking: true, rank: 2, isFeatured: false, appUrl: '/apps/peekaboo' },
    { id: 'baby-3', title: 'タッチでぴょん', description: 'タッチするとキャラクターがジャンプ！', thumbnailUrl: 'C', category: 'baby', tags: ['タッチ'], isRanking: true, rank: 3, isFeatured: false, appUrl: '/apps/touch-jump' },
    // おすすめ
    { id: 'baby-4', title: 'ゆらゆらオルゴール', description: '優しいメロディで赤ちゃんもリラックス', thumbnailUrl: 'A', category: 'baby', tags: ['音楽'], isRanking: false, rank: null, isFeatured: true, appUrl: '/apps/music-box' },
    { id: 'baby-5', title: 'どうぶつタッチ', description: '動物をタッチすると鳴き声が聞こえるよ', thumbnailUrl: 'B', category: 'baby', tags: ['どうぶつ'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/animal-touch' },
    { id: 'baby-6', title: 'ふわふわシャボン玉', description: 'タップでシャボン玉がふわふわ飛んでいく', thumbnailUrl: 'C', category: 'baby', tags: ['あそび'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/bubble' },
    { id: 'baby-7', title: 'きらきらおほしさま', description: 'キラキラ光るお星さまで視覚を刺激', thumbnailUrl: 'A', category: 'baby', tags: ['感覚'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/stars' },
    { id: 'baby-8', title: 'もぐもぐパクパク', description: 'かわいいキャラクターにごはんをあげよう', thumbnailUrl: 'B', category: 'baby', tags: ['ごっこ'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/feeding' },
    { id: 'baby-9', title: 'ぽんぽんたいこ', description: 'リズムに合わせてたいこをたたこう', thumbnailUrl: 'C', category: 'baby', tags: ['音楽'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/drum' },

    // ── 幼児 (infant) ─────────────────────
    // ランキング
    { id: 'infant-1', title: '動く！ずかんアプリ', description: '恐竜や動物たちが画面の中で動き出す！', thumbnailUrl: 'A', category: 'infant', tags: ['自然'], isRanking: true, rank: 1, isFeatured: true, appUrl: '/apps/zukan' },
    { id: 'infant-2', title: 'かず・とけいアプリ', description: '数字と時計の読み方を遊びながら学べる！', thumbnailUrl: 'B', category: 'infant', tags: ['数字'], isRanking: true, rank: 2, isFeatured: false, appUrl: '/apps/clock' },
    { id: 'infant-3', title: 'えいごであそぼ', description: 'アルファベットと簡単な英単語を楽しく学ぶ', thumbnailUrl: 'C', category: 'infant', tags: ['英語'], isRanking: true, rank: 3, isFeatured: false, appUrl: '/apps/english' },
    // おすすめ
    { id: 'infant-4', title: 'ひらがなタッチ', description: 'ひらがなを指でなぞって覚えよう', thumbnailUrl: 'A', category: 'infant', tags: ['文字'], isRanking: false, rank: null, isFeatured: true, appUrl: '/apps/hiragana-touch' },
    { id: 'infant-5', title: 'いろとかたち', description: '色と形の名前を楽しく覚えよう', thumbnailUrl: 'B', category: 'infant', tags: ['知育'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/colors-shapes' },
    { id: 'infant-6', title: 'おかいものごっこ', description: 'お店屋さんごっこで数やお金を学ぼう', thumbnailUrl: 'C', category: 'infant', tags: ['ごっこ'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/shopping' },
    { id: 'infant-7', title: 'パズルであそぼ', description: '簡単なパズルで考える力を育てる', thumbnailUrl: 'A', category: 'infant', tags: ['パズル'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/puzzle' },
    { id: 'infant-8', title: 'おえかきボード', description: '自由にお絵かきして創造力を育てよう', thumbnailUrl: 'B', category: 'infant', tags: ['お絵かき'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/drawing' },
    { id: 'infant-9', title: 'どうぶつのうた', description: '動物の歌を歌って楽しく学ぼう', thumbnailUrl: 'C', category: 'infant', tags: ['音楽'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/animal-songs' },

    // ── 低学年 (low) ──────────────────────
    // ランキング
    { id: 'low-1', title: 'ひらがな・カタカナアプリ', description: '楽しくひらがなとカタカナを覚えよう！', thumbnailUrl: 'A', category: 'low', tags: ['文字'], isRanking: true, rank: 1, isFeatured: true, appUrl: '/apps/hiragana' },
    { id: 'low-2', title: 'たしざん・ひきざん', description: '計算の基礎をゲーム感覚で学ぼう', thumbnailUrl: 'B', category: 'low', tags: ['算数'], isRanking: true, rank: 2, isFeatured: false, appUrl: '/apps/math-basic' },
    { id: 'low-3', title: '数直線マスター', description: '数直線を使って数の大きさを理解しよう', thumbnailUrl: 'C', category: 'low', tags: ['算数'], isRanking: true, rank: 3, isFeatured: false, appUrl: '/apps/numberline' },
    // おすすめ
    { id: 'low-4', title: 'パクパク分度器', description: '角度の測り方を楽しく学べる', thumbnailUrl: 'A', category: 'low', tags: ['図形'], isRanking: false, rank: null, isFeatured: true, appUrl: '/apps/protractor' },
    { id: 'low-5', title: 'かんじドリル', description: '1・2年生の漢字を楽しく練習', thumbnailUrl: 'B', category: 'low', tags: ['漢字'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/kanji-drill' },
    { id: 'low-6', title: '九九チャレンジ', description: 'リズムに乗って九九をマスター', thumbnailUrl: 'C', category: 'low', tags: ['算数'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/times-table' },
    { id: 'low-7', title: 'とけいマスター', description: '時計の読み方を完璧にマスター', thumbnailUrl: 'A', category: 'low', tags: ['時計'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/clock-master' },
    { id: 'low-8', title: 'えいごリスニング', description: '英語の音に慣れよう', thumbnailUrl: 'B', category: 'low', tags: ['英語'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/english-listen' },
    { id: 'low-9', title: 'しょくぶつかんさつ', description: '植物の成長を観察しよう', thumbnailUrl: 'C', category: 'low', tags: ['理科'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/plant-watch' },

    // ── 高学年 (high) ─────────────────────
    // ランキング
    { id: 'high-1', title: '理科実験室', description: 'バーチャル実験で科学の不思議を体験', thumbnailUrl: 'A', category: 'high', tags: ['理科'], isRanking: true, rank: 1, isFeatured: true, appUrl: '/apps/science' },
    { id: 'high-2', title: '漢字クイズ', description: '読み書きで漢字力アップ', thumbnailUrl: 'B', category: 'high', tags: ['漢字'], isRanking: true, rank: 2, isFeatured: false, appUrl: '/apps/kanji' },
    { id: 'high-3', title: '気温と降水確率', description: '天気予報を見ながらグラフの読み方を学ぼう', thumbnailUrl: 'C', category: 'high', tags: ['グラフ'], isRanking: true, rank: 3, isFeatured: false, appUrl: '/apps/weather' },
    // おすすめ
    { id: 'high-4', title: '分数マスター', description: '分数の計算をビジュアルで理解', thumbnailUrl: 'A', category: 'high', tags: ['算数'], isRanking: false, rank: null, isFeatured: true, appUrl: '/apps/fractions' },
    { id: 'high-5', title: '歴史タイムライン', description: '日本の歴史を時代順に学ぼう', thumbnailUrl: 'B', category: 'high', tags: ['社会'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/history' },
    { id: 'high-6', title: '英文法チャレンジ', description: '基礎英文法をゲームで学ぶ', thumbnailUrl: 'C', category: 'high', tags: ['英語'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/english-grammar' },
    { id: 'high-7', title: '地図マスター', description: '都道府県と世界の国を覚えよう', thumbnailUrl: 'A', category: 'high', tags: ['社会'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/map-master' },
    { id: 'high-8', title: 'プログラミング入門', description: 'ブロックでプログラミングの基礎を学ぶ', thumbnailUrl: 'B', category: 'high', tags: ['プログラミング'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/programming' },
    { id: 'high-9', title: '星座ガイド', description: '季節の星座を見つけよう', thumbnailUrl: 'C', category: 'high', tags: ['理科'], isRanking: false, rank: null, isFeatured: false, appUrl: '/apps/constellation' },
];
