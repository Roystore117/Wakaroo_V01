# アプリ構成図

## ディレクトリ構成

```
Wakaroo_MVP_v1/
├── .ai_docs/                    # AI用ドキュメント（このフォルダ）
│   ├── project_info.md
│   ├── tech_stack.md
│   ├── current_status.md
│   ├── design_rules.md
│   └── app_structure.md
│
├── public/
│   ├── images/
│   │   ├── bg-main.png          # 背景画像（気球）
│   │   └── rank1-3.png          # ランキング画像
│   ├── manifest.json            # PWA設定
│   └── *.svg                    # アイコン類
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # グローバルレイアウト
│   │   ├── page.tsx             # トップページ
│   │   ├── globals.css          # グローバルCSS
│   │   ├── apps/
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # アプリ詳細ページ
│   │   ├── play/
│   │   │   └── page.tsx         # プレイページ（iframe）
│   │   ├── favorites/
│   │   │   └── page.tsx         # お気に入りページ
│   │   ├── community/
│   │   │   └── page.tsx         # イドバタ掲示板
│   │   └── profile/
│   │       └── page.tsx         # マイページ
│   │
│   ├── components/
│   │   ├── Header.tsx           # カテゴリタブ + 検索バー
│   │   ├── HeroSection.tsx      # トップヒーロー
│   │   ├── TagSection.tsx       # 悩みタグセクション
│   │   ├── HorizontalAppCard.tsx # 横型アプリカード
│   │   ├── DetailView.tsx       # 詳細画面コンテンツ
│   │   ├── BottomNav.tsx        # 下部ナビゲーション
│   │   ├── FloatingActionButton.tsx
│   │   ├── PostAppModal.tsx     # アプリ投稿モーダル
│   │   ├── AppCard.tsx          # （未使用/旧）
│   │   ├── RankingSection.tsx   # （未使用）
│   │   ├── RecommendedApps.tsx  # （未使用）
│   │   └── SearchBar.tsx        # （未使用）
│   │
│   └── data/
│       └── mockData.ts          # モックデータ + 型定義
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts           # （Tailwind v4 は CSS で設定）
└── README.md
```

---

## 各ファイルの役割

### layout.tsx（グローバルレイアウト）
```typescript
// フォント設定
const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mplus-rounded',
});

// メタデータ
export const metadata: Metadata = {
  title: 'wakaroo - 知育アプリポータル',
  description: '子育てに役立つ知育アプリをザッピング感覚で探せる',
  manifest: '/manifest.json',
};

// ビューポート設定（PWA対応）
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};
```

### page.tsx（トップページ）
- カテゴリステート管理
- スワイプ検出（touchstart/touchend）
- Framer Motionスライドアニメーション
- 悩みタグ別セクション表示

### apps/[slug]/page.tsx（詳細ページ）
- URLパラメータからslug取得
- mockDataから該当Post取得
- DetailViewコンポーネント表示

### play/page.tsx（プレイページ）
- URLクエリ（?url=...）からアプリURL取得
- iframeでフルスクリーン表示
- 閉じるボタン（トップに戻る）

### favorites/page.tsx（お気に入りページ）
- Empty State表示（お気に入りがない場合）
- ホームへ戻るボタン

### community/page.tsx（イドバタ掲示板）
- 悩み投稿フォーム
- 悩みカードリスト
- 「わかるー！」ボタン（カウントアップ + キラキラアニメ）
- 「この悩みを解決するアプリを作る / 教える」ボタン

### profile/page.tsx（マイページ）
- プロフィールカード
- 活動実績（あそんだ数、投稿したアプリ数）
- 設定メニュー

---

## 画面遷移フロー

```
BottomNav（全画面共通）
    ├── ホーム (/)
    ├── お気に入り (/favorites)
    ├── イドバタ! (/community)
    └── マイページ (/profile)

トップページ (/)
    │
    ├── [カテゴリタブタップ] → 同ページ内切り替え（スライドアニメーション）
    │
    ├── [スワイプ] → カテゴリ切り替え（スライドアニメーション）
    │
    ├── [タグタップ] → タグフィルタリングモード（ページ内切り替え）
    │
    ├── [FABタップ] → 投稿モーダル（PostAppModal）
    │                     │
    │                     ├── [キャンセル] → トップページに戻る
    │                     │
    │                     └── [投稿する] → 紙吹雪 → トップページに戻る
    │
    └── [アプリカードタップ] → 詳細ページ (/apps/[slug])
                                    │
                                    ├── [戻るボタン] → トップページ
                                    │
                                    └── [あそぶボタン] → プレイページ (/play?url=...)
                                                            │
                                                            └── [閉じるボタン] → ポストプレイモーダル
                                                                                    │
                                                                                    └── [あそんだよ！] → 紙吹雪 → トップページ

お気に入りページ (/favorites)
    └── [アプリをさがしにいく] → トップページ

イドバタ掲示板 (/community)
    ├── [悩み投稿] → リストに追加
    ├── [わかるー！] → カウントアップ + キラキラ
    └── [解決ボタン] → console.log（将来的にアプリ紐付け）

マイページ (/profile)
    └── [設定メニュー] → console.log（将来的に各機能実装）
```

---

## 主要コンポーネント依存関係

```
page.tsx (トップ)
├── Header
├── HeroSection
├── TagSection
│   └── HorizontalAppCard
├── BottomNav
├── FloatingActionButton
└── PostAppModal

apps/[slug]/page.tsx (詳細)
└── DetailView
    └── (内部に固定フッター含む)

play/page.tsx (プレイ)
└── (単独: iframe + 閉じるボタン)

favorites/page.tsx (お気に入り)
└── BottomNav

community/page.tsx (イドバタ)
└── BottomNav

profile/page.tsx (マイページ)
└── BottomNav
```

---

## データフロー

```
mockData.ts
    │
    ├── categories[]     → Header（タブ表示）
    ├── worryTags[]      → page.tsx（タグ選択）
    ├── mockPosts[]      → TagSection（カード表示）
    │
    └── getPostsByWorryTag(tagId)
        └── worryTagPostMapping → Post[] 返却
```
