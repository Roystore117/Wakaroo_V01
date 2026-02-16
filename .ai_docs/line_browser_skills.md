# LINE内ブラウザ互換性スキル

WakarooはLINEリッチメニューから起動されるため、LINE内ブラウザ（iOS WKWebView / Android WebView）で正常に動作させる必要がある。以下はLINE内ブラウザ特有の制約と、このプロジェクトで採用している対策パターンをまとめたもの。

---

## 1. ビューポート高さ（100vh問題）

**問題:** `100vh`はLINEのヘッダー/フッターのクローム部分を含むため、コンテンツがLINEバーの下に隠れる。

**対策パターン:**
- Tailwindの`h-screen`（= `100vh`）ではなく`h-dvh`（= `100dvh`）を使用する
- `dvh`未対応ブラウザ向けにインラインスタイルでフォールバック: `style={{ height: '100dvh' }}`
- モーダルの`max-h-[90vh]`も`max-h-[90dvh]`に変更する

```tsx
// ✅ 正しい
<div className="h-dvh w-full" style={{ height: '100dvh' }}>

// ❌ 避ける
<div className="h-screen w-full">
```

---

## 2. クロスオリジンiframeの無音失敗

**問題:** 多くの外部サイトは`X-Frame-Options: SAMEORIGIN/DENY`を設定しており、iframe内で真っ白な画面になる。LINE内ブラウザではエラーイベントが発火しない場合もある。

**対策パターン:**
- `onLoad` + `onError`イベントの両方をハンドリングする
- 5秒タイムアウトでiframeロード完了しない場合のフォールバックUIを表示
- 「外部ブラウザで開く」ボタンを提供する（`<a href={url} target="_blank">`）

```tsx
const [iframeError, setIframeError] = useState(false);

useEffect(() => {
    const timeout = setTimeout(() => {
        if (!iframeLoaded) {
            setIframeError(true);
        }
    }, 5000);
    return () => clearTimeout(timeout);
}, [iframeLoaded]);
```

---

## 3. `position: fixed` + ソフトキーボード（iOS WKWebView）

**問題:** iOS WKWebViewでは、inputにフォーカスしてキーボードが表示されると`position: fixed; bottom: 0`の要素がページと一緒にスクロールしてしまう。

**対策パターン:**
- フォーム画面のフッターボタン: `fixed` → `sticky` に変更
- スクロールコンテナ内に配置し、`sticky bottom-0`で画面下部に固定
- `fixed`を使う場合は`visualViewport` resize イベントで位置調整が必要

```tsx
// ✅ キーボード表示時も安定
<div className="sticky bottom-0 bg-white/95 backdrop-blur-sm">
    <button>送信</button>
</div>

// ❌ iOS WKWebViewでキーボード表示時にずれる
<div className="fixed bottom-0 bg-white/95 backdrop-blur-sm">
    <button>送信</button>
</div>
```

---

## 4. スワイプジェスチャーの競合

**問題:** `<main>`全体にタッチハンドラを設定すると、左端からのスワイプバック（LINE IABのiOS標準機能）が効かなくなる。

**対策パターン:**
- `handleTouchStart`で左端30px以内からのタッチを無視する
- `handleTouchEnd`でも同様にガードする

```tsx
const handleTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    touchStartX.current = startX;
    if (startX < 30) return; // LINEの戻るジェスチャーに委譲
};

const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current < 30) return; // 左端ガード
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
};
```

---

## 5. 外部URL直接遷移の防止

**問題:** AppCardのリンク先が外部URLの場合、Wakarooアプリから離脱してしまう。

**対策パターン:**
- `appUrl`が内部パス（`/`で始まる）の場合のみ`<Link>`でラップする
- 外部URLはプレイページ（`/play?url=`）または詳細ページ経由でアクセスさせる

```tsx
// ✅ 内部パスのみリンク化
if (!post.appUrl || !post.appUrl.startsWith('/')) {
    return card; // リンクなし
}
return <Link href={post.appUrl}>{card}</Link>;
```

---

## 6. `autoFocus`の回避

**問題:** Framer Motionのアニメーション中に`autoFocus`がキーボードを即座に開き、iOS WKWebViewでレイアウトが崩れる。

**対策パターン:**
- `autoFocus`属性を削除する
- 必要であればアニメーション完了後にプログラム的にフォーカス: `setTimeout(() => ref.current?.focus(), 350)`

---

## 7. `backdrop-filter`のフォールバック

**問題:** 古いiOS（12-13）のLINE内ブラウザでは`-webkit-backdrop-filter`プレフィックスが必要。Tailwindの`backdrop-blur-*`はプレフィックス無しのみ。

**対策パターン:**
- `globals.css`に`@supports not (backdrop-filter)`でフォールバック背景色を設定する

```css
@supports not (backdrop-filter: blur(1px)) {
    .backdrop-blur-sm {
        background-color: rgba(255, 255, 255, 0.92) !important;
    }
}
```

---

## 8. `env(safe-area-inset-*)`の注意点

**問題:** LINE内ブラウザが独自にノッチ対応している場合、bodyのsafe-area paddingと二重パディングになる可能性がある。

**対策パターン:**
- `env()`にフォールバック値を明示: `env(safe-area-inset-top, 0px)`
- 実機テストで確認し、必要に応じてUA判定で条件分岐

---

## 検証チェックリスト

LINE内ブラウザ対応の変更を行った際は、以下を確認する:

- [ ] `/play?url=`でiframeブロック時にフォールバックUIが表示される
- [ ] プレイ画面でゲームの下部がLINEクロームに隠れない
- [ ] モーダル内でキーボード表示時に送信ボタンが操作可能
- [ ] トップページで左端スワイプでLINEの「戻る」が動作する
- [ ] モーダルが画面からはみ出さない
- [ ] AppCardから外部サイトへ直接遷移しない

## 参考リンク

- [LIFF Browser vs External Browser](https://developers.line.biz/en/docs/liff/differences-between-liff-browser-and-external-browser/)
- [LIFF Development Guidelines](https://developers.line.biz/en/docs/liff/development-guidelines/)
- [liff-inspector (GitHub)](https://github.com/line/liff-inspector)
