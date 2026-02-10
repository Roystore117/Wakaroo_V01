# 開発計画書 (PLAN.md)

## プロジェクト概要

知育アプリをザッピング感覚で探せるポータルサイト「wakaroo」のホーム画面実装。
LINEリッチメニューから起動されるモバイルファーストPWA。

---

## 技術選定

| 技術 | 選定理由 |
|------|----------|
| **Next.js 14 (App Router)** | SSR/SSG対応、TypeScript統合、PWA構築に最適 |
| **Tailwind CSS** | ユーティリティファーストで高速スタイリング、レスポンシブ対応が容易 |
| **Framer Motion** | 軽量・宣言的なアニメーションAPI、スワイプジェスチャー検知 |
| **Lucide React** | 軽量でモダンなアイコンセット、Tree-shaking対応 |

---

## コンポーネント構成

```
src/
├── app/
│   ├── layout.tsx      # PWAメタデータ、フォント設定
│   ├── page.tsx        # ホーム画面（状態管理・スワイプ）
│   └── globals.css     # グローバルスタイル
├── components/
│   ├── Header.tsx      # カテゴリタブ
│   ├── SearchBar.tsx   # 検索セクション
│   ├── RankingSection.tsx   # ランキング表示
│   ├── RecommendedApps.tsx  # おすすめアプリ
│   ├── AppCard.tsx     # 共通アプリカード
│   └── BottomNav.tsx   # ボトムナビゲーション
└── data/
    └── mockData.ts     # 型定義 + モックデータ
```

---

## UIコンポーネント詳細

### A. Header（カテゴリタブ）
- **項目**: ベビー / 幼児 / 低学年 / 高学年
- **カラー**: ピンク / 黄色 / オレンジ / 青（グラデーション）
- **挙動**: タップ or スワイプで切り替え、アクティブ状態強調

### B. SearchBar（検索セクション）
- 虫眼鏡アイコン + 入力フィールド
- フォーカス時のビジュアルフィードバック

### C. RankingSection（ランキング）
- 横スクロール表示
- 1~3位にゴールド/シルバー/ブロンズバッジ

### D. RecommendedApps（おすすめアプリ）
- 3列グリッドレイアウト
- 正方形サムネイル

### E. BottomNav（ボトムナビゲーション）
- ホーム / お気に入り / イドバタ! / マイページ
- 固定フッター、アクティブ状態強調

---

## データ設計

```typescript
export interface AppData {
  id: string;
  category: 'baby' | 'infant' | 'low' | 'high';
  title: string;
  image: string;
  isRanking: boolean;
  rank?: number;
  tags?: string[];
}
```

`mockData.ts`を編集するだけで全コンテンツが動的に更新される設計。

---

## 実装ロジック

1. `activeCategory`ステートで現在のカテゴリを管理
2. Framer Motionでスワイプジェスチャーを検知
3. カテゴリ変更時にスライドアニメーションで遷移
4. `mockApps`からフィルタリングして表示
