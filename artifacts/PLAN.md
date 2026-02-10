# Wakaroo MVP — 開発計画書

## プロジェクト概要

**プロジェクト名**: wakaroo  
**概要**: 知育アプリをザッピング感覚で探せるポータルサイト  
**形式**: モバイルファーストPWA（LINEリッチメニューから起動）

---

## 技術選定

| 技術 | バージョン | 選定理由 |
|------|-----------|----------|
| Next.js (App Router) | 16.1.6 | SSR/SSG対応、TypeScript統合、PWA構築に最適 |
| TypeScript | 5.x | 型安全なコード、開発生産性向上 |
| Tailwind CSS | 4.x | ユーティリティファーストで高速スタイリング |
| Framer Motion | 12.x | 軽量・宣言的アニメーション、スワイプジェスチャー |
| Lucide React | 0.563.x | 軽量でモダンなアイコンセット |

---

## 画面構成

### ホーム画面 (`/`)
- **Header**: カテゴリタブ（ベビー / 幼児 / 低学年 / 高学年）
- **SearchBar**: アプリ検索
- **RankingSection**: ランキング表示（3列グリッド、メダルバッジ）
- **RecommendedApps**: おすすめアプリ（3列グリッド）
- **BottomNav**: 固定フッター（ホーム / お気に入り / イドバタ! / マイページ）
- **FloatingActionButton**: 投稿ボタン

### 詳細画面 (`/apps/[slug]`)
- アプリ情報（サムネイル、タイトル、対象年齢、カテゴリ、評価）
- 説明文 + 「もっと見る」
- プレイボタン + お気に入りボタン
- タブ切り替え（レビュー掲示板 / 詳細情報）
- コメント入力エリア

---

## コンポーネント構成

```
src/
├── app/
│   ├── layout.tsx           # PWAメタデータ、Noto Sans JPフォント
│   ├── page.tsx             # ホーム画面（スワイプ対応）
│   ├── globals.css          # グローバルスタイル
│   └── apps/[slug]/
│       └── page.tsx         # アプリ詳細ページ（動的ルーティング）
├── components/
│   ├── Header.tsx           # カテゴリタブ
│   ├── SearchBar.tsx        # 検索バー
│   ├── RankingSection.tsx   # ランキング表示
│   ├── RecommendedApps.tsx  # おすすめアプリ
│   ├── AppCard.tsx          # 共通カード（バッジ・リンク付き）
│   ├── DetailView.tsx       # アプリ詳細ビュー
│   ├── BottomNav.tsx        # 下部固定ナビ
│   └── FloatingActionButton.tsx  # 投稿FAB
└── data/
    └── mockData.ts          # 型定義 + モックデータ + ヘルパー関数
```

---

## データ設計

### カテゴリ

| ID | ラベル | カラー |
|----|--------|--------|
| `baby` | ベビー | `#EC4899` (ピンク) |
| `infant` | 幼児 | `#F59E0B` (アンバー) |
| `low` | 低学年 | `#F97316` (オレンジ) |
| `high` | 高学年 | `#3B82F6` (ブルー) |

### Post データ構造

各カテゴリ: ランキング3件 + おすすめ9件 = 12件 × 4カテゴリ = **計48件**

```typescript
interface Post {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: Category;
  tags: Tag[];
  author: Author;
  status: PostStatus;
  isRanking: boolean;
  rank: number | null;
  isFeatured: boolean;
  meta: PostMeta;
  appUrl: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
```

---

## UX方針

1. **スワイプ遷移**: カテゴリ間をスワイプで直感的に移動（Framer Motion Spring physics）
2. **最小タップ**: カード → 詳細 → プレイの最短導線
3. **プレースホルダー対応**: 実画像が無い段階でもアルファベットで視覚的に判別可能
4. **PWA最適化**: ステータスバー、セーフエリア、ビューポート固定設定済み
