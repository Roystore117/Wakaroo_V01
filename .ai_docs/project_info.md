# Wakaroo プロジェクト概要

## アプリの目的
パパママ向けの子ども用Webアプリプラットフォーム「Wakaroo」
- 子育てに役立つ知育アプリをザッピング感覚で探せるポータルサイト
- 開発者（パパエンジニア）が作ったアプリを共有・発見できる場

## ターゲットユーザー
- **主要ターゲット**: 0〜12歳の子どもを持つパパ・ママ
- **セカンダリ**: 知育アプリを作りたいパパエンジニア・ママエンジニア

## カテゴリ構成
| ID | ラベル | カラー | 対象年齢 |
|----|--------|--------|----------|
| baby | ベビー | pink-500 | 0〜2歳 |
| infant | 幼児 | amber-500 | 3〜5歳 |
| low | 低学年 | orange-500 | 6〜8歳 |
| high | 高学年 | blue-500 | 9〜12歳 |

---

## データ構造定義

### Category（カテゴリ型）
```typescript
type Category = 'baby' | 'infant' | 'low' | 'high';
```

### CategoryConfig（カテゴリ設定）
```typescript
interface CategoryConfig {
    id: Category;
    label: string;      // "ベビー", "幼児" など
    color: string;      // HEXカラー
    bgClass: string;    // Tailwind bg クラス
    activeClass: string; // アクティブ時のグラデーション
}
```

### Author（投稿者情報）
```typescript
interface Author {
    id: string;
    name: string;           // "ロイ＠パパエンジニア"
    avatarUrl: string | null;
    isVerified: boolean;    // 公認フラグ
    role: string;           // "アプリ開発者"
    badges: string[];       // ["公認クリエイター", "人気作者"]
}
```

### PostMeta（メタ情報）
```typescript
interface PostMeta {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    bookmarkCount: number;
    playedCount: number;    // あそんだよ数（重要指標）
}
```

### Story（開発ストーリー）
```typescript
interface Story {
    title: string;   // "子どもの「なぜ？」から生まれたアプリ"
    content: string; // 開発のきっかけ詳細
}
```

### WorryTag（悩みタグ）
```typescript
interface WorryTag {
    id: string;           // "wt1"
    label: string;        // "#5分で終わる"
    slug: string;         // "5min"
    categoryLabel: string; // "生活部門"
}
```

### Post（メインデータ構造）
```typescript
interface Post {
    id: string;

    // 基本情報
    title: string;
    description: string;
    thumbnailUrl: string;   // 画像URL or プレースホルダー文字

    // カテゴリ・タグ
    category: Category;
    tags: Tag[];

    // 投稿者
    author: Author;

    // ステータス
    status: PostStatus;     // 'draft' | 'published' | 'archived' | 'deleted'

    // ランキング関連
    isRanking: boolean;
    rank: number | null;    // 1〜3位

    // おすすめフラグ
    isFeatured: boolean;

    // メタ情報
    meta: PostMeta;

    // 開発ストーリー
    story: Story;

    // 悩みタグID
    worryTagIds?: string[];

    // アプリURL
    appUrl: string | null;  // "/apps/sound-color" など

    // 日時
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
}
```

## 悩みタグ一覧
| ID | ラベル | スラッグ | 部門 |
|----|--------|----------|------|
| wt1 | #5分で終わる | 5min | 生活部門 |
| wt2 | #時計読めない | clock | 学習部門 |
| wt3 | #歯磨き嫌い | toothbrush | 生活部門 |
| wt4 | #夜泣き | nightcry | ベビー部門 |
| wt5 | #ひらがな覚えたい | hiragana | 学習部門 |
| wt6 | #数字に興味 | numbers | 学習部門 |
