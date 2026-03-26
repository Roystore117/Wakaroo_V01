# wakaroo - 知育アプリポータル

子育てに役立つ知育アプリをザッピング感覚で探せるモバイルファーストPWAポータル。LINEリッチメニューからの起動を想定。UIはすべて日本語。

---

## 🚀 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) + TypeScript |
| スタイリング | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| アニメーション | Framer Motion |
| バックエンド | Supabase (Postgres + Storage) |
| AI生成 | Google Gemini API (`@google/generative-ai`) / Anthropic Claude API (`@anthropic-ai/sdk`) |
| フォント | M PLUS Rounded 1c (Google Fonts, 400/700) |
| アイコン | Lucide React |

---

## 📂 プロジェクト構成

```
src/
├── app/
│   ├── layout.tsx                    # ルートレイアウト（フォント・固定背景・PWAメタ）
│   ├── page.tsx                      # ホーム（カテゴリタブ: top/baby/infant/low/high）
│   ├── create/
│   │   └── page.tsx                  # 知育アプリ生成ページ（スマホモックUI）
│   ├── apps/[slug]/
│   │   └── page.tsx                  # アプリ詳細（Server Component）
│   ├── play/
│   │   └── page.tsx                  # 外部アプリプレイヤー（iframe）
│   ├── favorites/page.tsx            # お気に入り
│   ├── community/page.tsx            # コミュニティ（イドバタ掲示板）
│   ├── profile/page.tsx              # プロフィール
│   └── api/
│       └── generate/
│           └── route.ts              # Gemini / Claude API: HTML知育アプリ生成（ストリーミング）
├── components/
│   ├── AppCard.tsx                   # アプリカード
│   ├── BottomNav.tsx                 # 下部ナビゲーション
│   ├── DetailView.tsx                # アプリ詳細ビュー
│   ├── FloatingActionButton.tsx      # FAB（アプリ投稿）
│   ├── Header.tsx                    # カテゴリタブヘッダー
│   ├── HeroSection.tsx               # カテゴリ別ヒーロー
│   ├── HorizontalAppCard.tsx         # 横スクロールカード
│   ├── PostAppModal.tsx              # アプリ投稿モーダル（AI審査アニメーション付き）
│   ├── SplashScreen.tsx              # スプラッシュ画面
│   ├── TagSection.tsx                # タグ別セクション
│   ├── TopBanners.tsx                # トップバナー
│   ├── TopHeroCarousel.tsx           # トップカルーセル
│   ├── TopMenuIcons.tsx              # トップメニューアイコン
│   ├── TopNewApps.tsx                # 新着アプリ
│   ├── TopPopularApps.tsx            # 人気アプリ
│   └── TopPopularCategories.tsx      # 人気カテゴリ
├── lib/
│   └── supabase.ts                   # Supabaseクライアント・型定義・fetch関数
├── data/
│   └── mockData.ts                   # Supabase未設定時のフォールバックデータ
└── utils/
    └── imageProcessor.ts             # Canvas正方形クロップ → WebP圧縮 → Storage upload
```

---

## 🛠️ セットアップ

```bash
npm install
npm run dev    # localhost:3000
npm run build  # 本番ビルド
npm run lint   # ESLint
```

---

## 🔑 環境変数

`.env.local` に以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
GEMINI_API_KEY=<google-gemini-api-key>
ANTHROPIC_API_KEY=<anthropic-api-key>
```

Supabase 未設定の場合は `src/data/mockData.ts` のデータで動作します。

---

## 🗄️ Supabase 構成

**テーブル**: `apps` / `worry_tags` / `hero_articles` / `top_carousel`

**Storageバケット**: `app-images`（パス: `thumbnails/{appId}.webp`）

`src/lib/supabase.ts` にクライアント・型定義・全fetch/write関数・`transformAppRow()` を集約。

---

## 🤖 知育アプリ生成（`/create`）

`/create` ページで1ステップのHTML生成フローを提供。

### APIエンドポイント

`POST /api/generate/route.ts` — Gemini または Claude API を呼び出し、HTMLファイルを1本ストリーミング生成して返す。

モデル名が `claude-` で始まる場合は Anthropic SDK を使用し、それ以外は Gemini を使用。

### 対応モデル

| キー | モデル |
|---|---|
| A | gemini-3-flash-preview |
| B | gemini-3.1-pro-preview |
| C | gemini-2.5-flash |
| D | gemini-2.5-pro |
| E | claude-sonnet-4-6（デフォルト） |
| F | claude-opus-4-6 |
| G | claude-sonnet-4-5 |
| H | claude-haiku-4-5 |

### プロンプト構造

```
[system] システム指示（Claude: systemパラメータ / Gemini: systemInstruction）
＋
[user] ヘッダープロンプト ＋ ユーザー入力 ＋ フッタープロンプト ＋ 品質参考サンプル（初回のみ）
       ※2回目以降は「修正指示 + 既存HTML + フッタープロンプト」
```

### Wakaroo設定プリセット

`/create` 画面でシステム指示・ヘッダー・フッター・品質参考サンプルをまとめて切り替えられる3種類のプリセット。

| プリセット | 用途 |
|---|---|
| DEMO | デモ用 |
| Normal | 通常用 |
| Flat | フラットデザイン用 |

### `/create` UI仕様

| 要素 | 説明 |
|---|---|
| 上半分（flex-1） | スマホモックアップ（黒枠・9:16・ステータスバー・ノッチ）でアプリをプレビュー |
| 下半分（shrink-0） | 操作パネル：Wakaroo設定 / API設定 / ユーザー入力 / 送信ボタン |
| Wakaroo設定 | プリセット切り替え＋システム指示・ベースプロンプト編集（折りたたみ・モック上にオーバーレイ表示） |
| API設定 | 使用モデル選択（折りたたみ） |
| 左上ボタン | Topページへ戻る |
| 右上ボタン | 「投稿する」→ PostAppModal を開き生成済みHTMLを自動セット（生成前はdisabled） |
| デバッグ表示 | 送信後にトークン使用量（入力・出力・合計）を表示 |

### レスポンス

```typescript
{
  html: string;       // 生成されたHTMLコード
  usage: {
    promptTokens: number | null;
    candidatesTokens: number | null;
    totalTokens: number | null;
  }
}
```

---

## 📱 カテゴリ構成

| ID | 表示名 | 対象年齢 |
|---|---|---|
| `top` | トップ | - |
| `baby` | ベビー | 0〜1歳 |
| `infant` | 幼児 | 2〜5歳 |
| `low` | 低学年 | 小1〜2 |
| `high` | 高学年 | 小3〜6 |

`top` タブのみ特別レイアウト（カルーセル・メニューアイコン・人気・カテゴリ・新着・バナー）。他タブはヒーロー + タグ別セクション。

---

## 📋 設計上の注意点

- **LINE IAB対応**: `100dvh` 使用・`fixed` 追加禁止・`autoFocus` 禁止・`backdrop-filter` フォールバック必要。詳細は `.ai_docs/line_browser_skills.md` 参照。
- **データフロー**: ほぼ全ページ `'use client'` + `useState`/`useEffect` でSupabaseからクライアント取得。例外は `apps/[slug]/page.tsx`（Server Component）。
- **画像**: Canvas正方形クロップ → WebP 800px/150KB → Supabase Storage。
- **スプラッシュ**: `sessionStorage` キー `wakaroo_splash_shown` でセッション内1回のみ表示。

---

## 📄 ライセンス

MIT
