// カテゴリ型定義
export type Category = 'baby' | 'infant' | 'low' | 'high';

// カテゴリ設定
export interface CategoryConfig {
    id: Category;
    label: string;
    color: string;
    bgClass: string;
    activeClass: string;
}

export const categories: CategoryConfig[] = [
    {
        id: 'baby',
        label: 'ベビー',
        color: '#EC4899',
        bgClass: 'bg-pink-500',
        activeClass: 'bg-gradient-to-r from-pink-400 to-pink-500'
    },
    {
        id: 'infant',
        label: '幼児',
        color: '#F59E0B',
        bgClass: 'bg-amber-500',
        activeClass: 'bg-gradient-to-r from-amber-400 to-yellow-500'
    },
    {
        id: 'low',
        label: '低学年',
        color: '#F97316',
        bgClass: 'bg-orange-500',
        activeClass: 'bg-gradient-to-r from-orange-400 to-orange-500'
    },
    {
        id: 'high',
        label: '高学年',
        color: '#3B82F6',
        bgClass: 'bg-blue-500',
        activeClass: 'bg-gradient-to-r from-blue-400 to-blue-500'
    },
];

// ========================================
// 投稿（Post）データ構造
// ========================================

// 投稿者情報
export interface Author {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
    role: string;           // 肩書き
    badges: string[];       // 公認バッジ
}

// 投稿のメタ情報
export interface PostMeta {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    bookmarkCount: number;
    playedCount: number;    // あそんだよ数
}

// 投稿のステータス
export type PostStatus = 'draft' | 'published' | 'archived' | 'deleted';

// タグ情報
export interface Tag {
    id: string;
    name: string;
    slug: string;
}

// 開発ストーリー
export interface Story {
    title: string;
    content: string;
}

// 悩みタグ
export interface WorryTag {
    id: string;
    label: string;       // 表示名 "#時計読めない"
    slug: string;        // URL用
    categoryLabel: string; // 部門名 "生活部門"
}

// 悩みタグ一覧
export const worryTags: WorryTag[] = [
    { id: 'wt1', label: '#5分で終わる', slug: '5min', categoryLabel: '生活部門' },
    { id: 'wt2', label: '#時計読めない', slug: 'clock', categoryLabel: '学習部門' },
    { id: 'wt3', label: '#歯磨き嫌い', slug: 'toothbrush', categoryLabel: '生活部門' },
    { id: 'wt4', label: '#夜泣き', slug: 'nightcry', categoryLabel: 'ベビー部門' },
    { id: 'wt5', label: '#ひらがな覚えたい', slug: 'hiragana', categoryLabel: '学習部門' },
    { id: 'wt6', label: '#数字に興味', slug: 'numbers', categoryLabel: '学習部門' },
];

// 投稿データ（メインのデータ構造）
export interface Post {
    id: string;

    // 基本情報
    title: string;
    description: string;
    thumbnailUrl: string;

    // カテゴリ・タグ
    category: Category;
    tags: Tag[];

    // 投稿者
    author: Author;

    // ステータス
    status: PostStatus;

    // ランキング関連
    isRanking: boolean;
    rank: number | null;

    // おすすめフラグ
    isFeatured: boolean;

    // メタ情報
    meta: PostMeta;

    // 開発ストーリー
    story: Story;

    // 悩みタグID（複数可、オプショナル）
    worryTagIds?: string[];

    // アプリURL（外部リンク or 内部ページ）
    appUrl: string | null;

    // 日時
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
}

// ========================================
// ホーム画面表示用（簡易型）
// ========================================

// ホーム画面ではサムネイル画像のみ表示
export interface PostCard {
    id: string;
    thumbnailUrl: string;
    rank: number | null;
}

// ========================================
// モックデータ
// ========================================

// デフォルト投稿者
const defaultAuthor: Author = {
    id: 'author-1',
    name: 'ロイ＠パパエンジニア',
    avatarUrl: null,
    isVerified: true,
    role: 'アプリ開発者',
    badges: ['公認クリエイター', '人気作者'],
};

// デフォルトメタ情報
const defaultMeta: PostMeta = {
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    bookmarkCount: 0,
    playedCount: 0,
};

// デフォルト開発ストーリー
const defaultStory: Story = {
    title: '子どもの「なぜ？」から生まれたアプリ',
    content: '息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。',
};

// 現在日時
const now = new Date().toISOString();

// モック投稿データ
// 各カテゴリ: ランキング3件 + おすすめ9件 = 12件 × 4カテゴリ = 48件
export const mockPosts: Post[] = [
    // ========================================
    // ベビー (baby) - 12件
    // ========================================
    // ランキング 1-3
    {
        id: 'baby-1',
        title: '音と色のあそび',
        description: 'タッチすると音が鳴る！色と音で感覚を育てる',
        thumbnailUrl: 'A',
        category: 'baby',
        tags: [{ id: 't1', name: '感覚', slug: 'sense' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 1,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 15000, likeCount: 1200, playedCount: 1240 },
        story: { title: '赤ちゃんの好奇心を刺激したくて', content: '息子が生後6ヶ月の頃、スマホの画面に興味津々で。安心して触れるアプリを作りたかったんです。' },
        worryTagIds: ['wt1', 'wt4'],
        appUrl: '/apps/sound-color',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-2',
        title: 'いないいないばあ',
        description: '赤ちゃんが喜ぶいないいないばあアプリ',
        thumbnailUrl: 'B',
        category: 'baby',
        tags: [{ id: 't2', name: 'あそび', slug: 'play' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 2,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 12000, likeCount: 980, playedCount: 856 },
        story: defaultStory,
        worryTagIds: ['wt4'],
        appUrl: '/apps/peekaboo',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-3',
        title: 'タッチでぴょん',
        description: 'タッチするとキャラクターがジャンプ！',
        thumbnailUrl: 'C',
        category: 'baby',
        tags: [{ id: 't3', name: 'タッチ', slug: 'touch' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 3,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 9500, likeCount: 750, playedCount: 623 },
        story: defaultStory,
        worryTagIds: ['wt1'],
        appUrl: '/apps/touch-jump',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    // おすすめ 4-12
    {
        id: 'baby-4',
        title: 'ゆらゆらオルゴール',
        description: '優しいメロディで赤ちゃんもリラックス',
        thumbnailUrl: 'D',
        category: 'baby',
        tags: [{ id: 't4', name: '音楽', slug: 'music' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 8000, likeCount: 620, playedCount: 445 },
        story: defaultStory,
        worryTagIds: ['wt4'],
        appUrl: '/apps/music-box',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-5',
        title: 'どうぶつタッチ',
        description: '動物をタッチすると鳴き声が聞こえるよ',
        thumbnailUrl: 'E',
        category: 'baby',
        tags: [{ id: 't5', name: 'どうぶつ', slug: 'animal' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 7200, likeCount: 540, playedCount: 389 },
        story: defaultStory,
        appUrl: '/apps/animal-touch',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-6',
        title: 'ふわふわシャボン玉',
        description: 'タップでシャボン玉がふわふわ飛んでいく',
        thumbnailUrl: 'F',
        category: 'baby',
        tags: [{ id: 't6', name: 'あそび', slug: 'play' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6800, likeCount: 510, playedCount: 312 },
        story: defaultStory,
        appUrl: '/apps/bubble',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-7',
        title: 'きらきらおほしさま',
        description: 'キラキラ光るお星さまで視覚を刺激',
        thumbnailUrl: 'G',
        category: 'baby',
        tags: [{ id: 't7', name: '感覚', slug: 'sense' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6500, likeCount: 480, playedCount: 278 },
        story: defaultStory,
        appUrl: '/apps/stars',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-8',
        title: 'もぐもぐパクパク',
        description: 'かわいいキャラクターにごはんをあげよう',
        thumbnailUrl: 'H',
        category: 'baby',
        tags: [{ id: 't8', name: 'ごっこ', slug: 'pretend' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6200, likeCount: 450, playedCount: 234 },
        story: defaultStory,
        appUrl: '/apps/feeding',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-9',
        title: 'ぽんぽんたいこ',
        description: 'リズムに合わせてたいこをたたこう',
        thumbnailUrl: 'I',
        category: 'baby',
        tags: [{ id: 't9', name: '音楽', slug: 'music' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5900, likeCount: 420, playedCount: 198 },
        story: defaultStory,
        appUrl: '/apps/drum',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-10',
        title: 'くるくるメリー',
        description: 'カラフルなメリーがくるくる回る',
        thumbnailUrl: 'J',
        category: 'baby',
        tags: [{ id: 't10', name: '感覚', slug: 'sense' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5600, likeCount: 390, playedCount: 167 },
        story: defaultStory,
        appUrl: '/apps/merry',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-11',
        title: 'にこにこかお',
        description: 'いろんな表情のお顔で遊ぼう',
        thumbnailUrl: 'K',
        category: 'baby',
        tags: [{ id: 't11', name: 'あそび', slug: 'play' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5300, likeCount: 360, playedCount: 145 },
        story: defaultStory,
        appUrl: '/apps/faces',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'baby-12',
        title: 'おやすみライト',
        description: 'やさしい光で寝かしつけをサポート',
        thumbnailUrl: 'L',
        category: 'baby',
        tags: [{ id: 't12', name: 'ねんね', slug: 'sleep' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5000, likeCount: 330, playedCount: 112 },
        story: defaultStory,
        appUrl: '/apps/night-light',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },

    // ========================================
    // 幼児 (infant) - 12件
    // ========================================
    // ランキング 1-3
    {
        id: 'infant-1',
        title: '動く！ずかんアプリ',
        description: '恐竜や動物たちが画面の中で動き出す！',
        thumbnailUrl: 'A',
        category: 'infant',
        tags: [{ id: 't13', name: '自然', slug: 'nature' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 1,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 18000, likeCount: 1500, playedCount: 2340 },
        story: { title: '恐竜好きな息子のために', content: '4歳の息子が恐竜に夢中で、図鑑だけじゃ物足りなくなったので動くずかんを作りました！' },
        appUrl: '/apps/zukan',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-2',
        title: 'かず・とけいアプリ',
        description: '数字と時計の読み方を遊びながら学べる！',
        thumbnailUrl: 'B',
        category: 'infant',
        tags: [{ id: 't14', name: '数字', slug: 'numbers' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 2,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 14000, likeCount: 1100, playedCount: 1890 },
        story: defaultStory,
        appUrl: '/apps/clock',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-3',
        title: 'えいごであそぼ',
        description: 'アルファベットと簡単な英単語を楽しく学ぶ',
        thumbnailUrl: 'C',
        category: 'infant',
        tags: [{ id: 't15', name: '英語', slug: 'english' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 3,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 11000, likeCount: 890, playedCount: 1456 },
        story: defaultStory,
        appUrl: '/apps/english',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    // おすすめ 4-12
    {
        id: 'infant-4',
        title: 'ひらがなタッチ',
        description: 'ひらがなを指でなぞって覚えよう',
        thumbnailUrl: 'D',
        category: 'infant',
        tags: [{ id: 't16', name: '文字', slug: 'letters' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 9500, likeCount: 720, playedCount: 987 },
        story: defaultStory,
        appUrl: '/apps/hiragana-touch',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-5',
        title: 'いろとかたち',
        description: '色と形の名前を楽しく覚えよう',
        thumbnailUrl: 'E',
        category: 'infant',
        tags: [{ id: 't17', name: '知育', slug: 'education' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 8800, likeCount: 650, playedCount: 756 },
        story: defaultStory,
        appUrl: '/apps/colors-shapes',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-6',
        title: 'おかいものごっこ',
        description: 'お店屋さんごっこで数やお金を学ぼう',
        thumbnailUrl: 'F',
        category: 'infant',
        tags: [{ id: 't18', name: 'ごっこ', slug: 'pretend' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 8200, likeCount: 590, playedCount: 634 },
        story: defaultStory,
        appUrl: '/apps/shopping',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-7',
        title: 'パズルであそぼ',
        description: '簡単なパズルで考える力を育てる',
        thumbnailUrl: 'G',
        category: 'infant',
        tags: [{ id: 't19', name: 'パズル', slug: 'puzzle' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 7600, likeCount: 530, playedCount: 523 },
        story: defaultStory,
        appUrl: '/apps/puzzle',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-8',
        title: 'おえかきボード',
        description: '自由にお絵かきして創造力を育てよう',
        thumbnailUrl: 'H',
        category: 'infant',
        tags: [{ id: 't20', name: 'お絵かき', slug: 'drawing' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 7200, likeCount: 490, playedCount: 445 },
        story: defaultStory,
        appUrl: '/apps/drawing',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-9',
        title: 'どうぶつのうた',
        description: '動物の歌を歌って楽しく学ぼう',
        thumbnailUrl: 'I',
        category: 'infant',
        tags: [{ id: 't21', name: '音楽', slug: 'music' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6800, likeCount: 450, playedCount: 378 },
        story: defaultStory,
        appUrl: '/apps/animal-songs',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-10',
        title: 'まちがいさがし',
        description: '2つの絵の違いを見つけよう',
        thumbnailUrl: 'J',
        category: 'infant',
        tags: [{ id: 't22', name: '観察', slug: 'observation' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6400, likeCount: 410, playedCount: 312 },
        story: defaultStory,
        appUrl: '/apps/spot-difference',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-11',
        title: 'きせかえドール',
        description: 'かわいいお洋服を着せ替えよう',
        thumbnailUrl: 'K',
        category: 'infant',
        tags: [{ id: 't23', name: 'ごっこ', slug: 'pretend' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6000, likeCount: 380, playedCount: 256 },
        story: defaultStory,
        appUrl: '/apps/dress-up',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'infant-12',
        title: 'カタカナタッチ',
        description: 'カタカナを指でなぞって覚えよう',
        thumbnailUrl: 'L',
        category: 'infant',
        tags: [{ id: 't24', name: '文字', slug: 'letters' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5600, likeCount: 350, playedCount: 189 },
        story: defaultStory,
        appUrl: '/apps/katakana-touch',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },

    // ========================================
    // 低学年 (low) - 12件
    // ========================================
    // ランキング 1-3
    {
        id: 'low-1',
        title: 'ひらがな・カタカナアプリ',
        description: '楽しくひらがなとカタカナを覚えよう！',
        thumbnailUrl: 'A',
        category: 'low',
        tags: [{ id: 't25', name: '文字', slug: 'letters' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 1,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 16000, likeCount: 1300, playedCount: 3120 },
        story: { title: '小1の宿題がきっかけで', content: '娘が小学校に入学してひらがな練習に苦戦していたので、楽しく練習できるアプリを作りました！' },
        appUrl: '/apps/hiragana',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-2',
        title: 'たしざん・ひきざん',
        description: '計算の基礎をゲーム感覚で学ぼう',
        thumbnailUrl: 'B',
        category: 'low',
        tags: [{ id: 't26', name: '算数', slug: 'math' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 2,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 13000, likeCount: 1050, playedCount: 2450 },
        story: defaultStory,
        appUrl: '/apps/math-basic',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-3',
        title: '数直線マスター',
        description: '数直線を使って数の大きさを理解しよう',
        thumbnailUrl: 'C',
        category: 'low',
        tags: [{ id: 't27', name: '算数', slug: 'math' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 3,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 10500, likeCount: 820, playedCount: 1876 },
        story: defaultStory,
        appUrl: '/apps/numberline',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    // おすすめ 4-12
    {
        id: 'low-4',
        title: 'パクパク分度器',
        description: '角度の測り方を楽しく学べる',
        thumbnailUrl: 'D',
        category: 'low',
        tags: [{ id: 't28', name: '図形', slug: 'shape' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 9000, likeCount: 680, playedCount: 1234 },
        story: defaultStory,
        appUrl: '/apps/protractor',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-5',
        title: 'かんじドリル',
        description: '1・2年生の漢字を楽しく練習',
        thumbnailUrl: 'E',
        category: 'low',
        tags: [{ id: 't29', name: '漢字', slug: 'kanji' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 8500, likeCount: 620, playedCount: 987 },
        story: defaultStory,
        appUrl: '/apps/kanji-drill',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-6',
        title: '九九チャレンジ',
        description: 'リズムに乗って九九をマスター',
        thumbnailUrl: 'F',
        category: 'low',
        tags: [{ id: 't30', name: '算数', slug: 'math' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 8000, likeCount: 570, playedCount: 845 },
        story: defaultStory,
        appUrl: '/apps/times-table',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-7',
        title: 'とけいマスター',
        description: '時計の読み方を完璧にマスター',
        thumbnailUrl: 'G',
        category: 'low',
        tags: [{ id: 't31', name: '時計', slug: 'clock' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 7500, likeCount: 520, playedCount: 712 },
        story: defaultStory,
        appUrl: '/apps/clock-master',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-8',
        title: 'えいごリスニング',
        description: '英語の音に慣れよう',
        thumbnailUrl: 'H',
        category: 'low',
        tags: [{ id: 't32', name: '英語', slug: 'english' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 7000, likeCount: 480, playedCount: 589 },
        story: defaultStory,
        appUrl: '/apps/english-listen',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-9',
        title: 'しょくぶつかんさつ',
        description: '植物の成長を観察しよう',
        thumbnailUrl: 'I',
        category: 'low',
        tags: [{ id: 't33', name: '理科', slug: 'science' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6500, likeCount: 430, playedCount: 456 },
        story: defaultStory,
        appUrl: '/apps/plant-watch',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-10',
        title: 'ながさくらべ',
        description: 'ものの長さを比べて測ろう',
        thumbnailUrl: 'J',
        category: 'low',
        tags: [{ id: 't34', name: '算数', slug: 'math' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6000, likeCount: 390, playedCount: 345 },
        story: defaultStory,
        appUrl: '/apps/length-compare',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-11',
        title: 'おはなしづくり',
        description: '絵を見てお話を作ろう',
        thumbnailUrl: 'K',
        category: 'low',
        tags: [{ id: 't35', name: '国語', slug: 'japanese' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5500, likeCount: 350, playedCount: 267 },
        story: defaultStory,
        appUrl: '/apps/story-maker',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'low-12',
        title: 'ずけいあそび',
        description: '三角・四角・丸で図形感覚を養う',
        thumbnailUrl: 'L',
        category: 'low',
        tags: [{ id: 't36', name: '図形', slug: 'shape' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5000, likeCount: 310, playedCount: 198 },
        story: defaultStory,
        appUrl: '/apps/shapes-play',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },

    // ========================================
    // 高学年 (high) - 12件
    // ========================================
    // ランキング 1-3
    {
        id: 'high-1',
        title: '理科実験室',
        description: 'バーチャル実験で科学の不思議を体験',
        thumbnailUrl: 'A',
        category: 'high',
        tags: [{ id: 't37', name: '理科', slug: 'science' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 1,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 17000, likeCount: 1400, playedCount: 4560 },
        story: { title: '理科の実験を安全に楽しめるように', content: '学校では危険でできない実験も、アプリなら安全に体験できます。好奇心を育てたいと思って作りました。' },
        appUrl: '/apps/science',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-2',
        title: '漢字クイズ',
        description: '読み書きで漢字力アップ',
        thumbnailUrl: 'B',
        category: 'high',
        tags: [{ id: 't38', name: '漢字', slug: 'kanji' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 2,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 14500, likeCount: 1150, playedCount: 3240 },
        story: defaultStory,
        appUrl: '/apps/kanji',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-3',
        title: '気温と降水確率',
        description: '天気予報を見ながらグラフの読み方を学ぼう',
        thumbnailUrl: 'C',
        category: 'high',
        tags: [{ id: 't39', name: 'グラフ', slug: 'graph' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: true,
        rank: 3,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 11500, likeCount: 900, playedCount: 2180 },
        story: defaultStory,
        appUrl: '/apps/weather',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    // おすすめ 4-12
    {
        id: 'high-4',
        title: '分数マスター',
        description: '分数の計算をビジュアルで理解',
        thumbnailUrl: 'D',
        category: 'high',
        tags: [{ id: 't40', name: '算数', slug: 'math' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: true,
        meta: { ...defaultMeta, viewCount: 9800, likeCount: 750, playedCount: 1560 },
        story: defaultStory,
        appUrl: '/apps/fractions',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-5',
        title: '歴史タイムライン',
        description: '日本の歴史を時代順に学ぼう',
        thumbnailUrl: 'E',
        category: 'high',
        tags: [{ id: 't41', name: '社会', slug: 'social' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 9200, likeCount: 690, playedCount: 1230 },
        story: defaultStory,
        appUrl: '/apps/history',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-6',
        title: '英文法チャレンジ',
        description: '基礎英文法をゲームで学ぶ',
        thumbnailUrl: 'F',
        category: 'high',
        tags: [{ id: 't42', name: '英語', slug: 'english' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 8700, likeCount: 640, playedCount: 987 },
        story: defaultStory,
        appUrl: '/apps/english-grammar',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-7',
        title: '地図マスター',
        description: '都道府県と世界の国を覚えよう',
        thumbnailUrl: 'G',
        category: 'high',
        tags: [{ id: 't43', name: '社会', slug: 'social' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 8200, likeCount: 590, playedCount: 756 },
        story: defaultStory,
        appUrl: '/apps/map-master',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-8',
        title: '図形の面積',
        description: 'いろいろな図形の面積を計算しよう',
        thumbnailUrl: 'H',
        category: 'high',
        tags: [{ id: 't44', name: '算数', slug: 'math' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 7700, likeCount: 540, playedCount: 589 },
        story: defaultStory,
        appUrl: '/apps/area-calc',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-9',
        title: 'プログラミング入門',
        description: 'ブロックでプログラミングの基礎を学ぶ',
        thumbnailUrl: 'I',
        category: 'high',
        tags: [{ id: 't45', name: 'プログラミング', slug: 'programming' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 7200, likeCount: 490, playedCount: 456 },
        story: defaultStory,
        appUrl: '/apps/programming',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-10',
        title: '読解力トレーニング',
        description: '文章を読んで問題に答えよう',
        thumbnailUrl: 'J',
        category: 'high',
        tags: [{ id: 't46', name: '国語', slug: 'japanese' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6700, likeCount: 440, playedCount: 345 },
        story: defaultStory,
        appUrl: '/apps/reading-comp',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-11',
        title: '星座ガイド',
        description: '季節の星座を見つけよう',
        thumbnailUrl: 'K',
        category: 'high',
        tags: [{ id: 't47', name: '理科', slug: 'science' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 6200, likeCount: 400, playedCount: 234 },
        story: defaultStory,
        appUrl: '/apps/constellation',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
    {
        id: 'high-12',
        title: '速さの計算',
        description: '速さ・時間・距離の関係を理解しよう',
        thumbnailUrl: 'L',
        category: 'high',
        tags: [{ id: 't48', name: '算数', slug: 'math' }],
        author: defaultAuthor,
        status: 'published',
        isRanking: false,
        rank: null,
        isFeatured: false,
        meta: { ...defaultMeta, viewCount: 5700, likeCount: 360, playedCount: 178 },
        story: defaultStory,
        appUrl: '/apps/speed-calc',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    },
];

// ========================================
// データ取得ヘルパー関数
// ========================================

// ランキング投稿取得（カテゴリでフィルタ可能）
export const getRankingPosts = (category?: Category): Post[] => {
    return mockPosts
        .filter((post) => post.isRanking && post.status === 'published')
        .filter((post) => !category || post.category === category)
        .sort((a, b) => (a.rank || 99) - (b.rank || 99));
};

// カテゴリ別投稿取得
export const getPostsByCategory = (category: Category | null): Post[] => {
    if (!category) {
        return mockPosts.filter((post) => !post.isRanking && post.status === 'published');
    }
    return mockPosts.filter(
        (post) => post.category === category && !post.isRanking && post.status === 'published'
    );
};

// おすすめ投稿取得（ランキング以外、カテゴリでフィルタ可能）
export const getRecommendedPosts = (category?: Category): Post[] => {
    return mockPosts
        .filter((post) => !post.isRanking && post.status === 'published')
        .filter((post) => !category || post.category === category);
};

// 注目投稿取得
export const getFeaturedPosts = (): Post[] => {
    return mockPosts.filter((post) => post.isFeatured && post.status === 'published');
};

// IDで投稿取得
export const getPostById = (id: string): Post | undefined => {
    return mockPosts.find((post) => post.id === id);
};

// appUrlのスラッグで投稿取得
export const getPostByAppSlug = (slug: string): Post | undefined => {
    const targetPath = `/apps/${slug}`;
    return mockPosts.find((post) => post.appUrl === targetPath);
};

// ホーム用カードデータに変換
export const toPostCard = (post: Post): PostCard => ({
    id: post.id,
    thumbnailUrl: post.thumbnailUrl,
    rank: post.rank,
});

// 悩みタグ別の投稿マッピング（手動設定）
const worryTagPostMapping: Record<string, string[]> = {
    'wt1': ['baby-3', 'infant-4', 'low-4'],            // #5分で終わる → 短時間で遊べる
    'wt2': ['infant-2', 'low-7', 'infant-1'],          // #時計読めない → 時計・数字系
    'wt3': ['baby-8', 'infant-6', 'baby-9'],           // #歯磨き嫌い → 生活習慣系
    'wt4': ['baby-4', 'baby-7', 'baby-12'],            // #夜泣き → 音・光・寝かしつけ系
    'wt5': ['infant-4', 'infant-12', 'low-1'],         // #ひらがな覚えたい → 文字系
    'wt6': ['infant-2', 'low-2', 'low-3'],             // #数字に興味 → 数字・計算系
};

// 悩みタグに関連する投稿を取得
export const getPostsByWorryTag = (tagId: string): Post[] => {
    const postIds = worryTagPostMapping[tagId] || [];
    return postIds
        .map((id) => mockPosts.find((post) => post.id === id))
        .filter((post): post is Post => post !== undefined && post.status === 'published');
};

// 悩みタグを取得
export const getWorryTagById = (tagId: string): WorryTag | undefined => {
    return worryTags.find((tag) => tag.id === tagId);
};
