# 技術スタック

## フレームワーク
- **Next.js 16.1.6** (App Router)
  - Turbopack 使用（高速ビルド）
  - Server Components + Client Components

## 言語
- **TypeScript 5.x**
  - 厳格な型チェック

## スタイリング
- **Tailwind CSS 4.x**
  - PostCSS経由で使用
  - カスタムカラー定義あり

## UIライブラリ
- **Framer Motion 12.x**
  - ページ遷移アニメーション
  - スライドアニメーション（カテゴリ切り替え）
  - フェードイン・スプリングアニメーション

## アイコン
- **Lucide React 0.563.x**
  - 使用アイコン例: ChevronLeft, Play, Hand, Crown, BadgeCheck, Sparkles, Heart など

## フォント
- **M PLUS Rounded 1c** (Google Fonts)
  - 丸ゴシック体
  - weight: 400, 700
  - 絵本のような柔らかい雰囲気

## React
- **React 19.2.3**
- **React DOM 19.2.3**

## デプロイ
- **Vercel** (予定)
  - Next.js最適化
  - Edge Functions対応

## 開発ツール
- **ESLint 9.x** + eslint-config-next
- **TypeScript** (型チェック)

## package.json スクリプト
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

## 主要な依存関係
```json
{
  "dependencies": {
    "framer-motion": "^12.34.0",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```
