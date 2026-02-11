# デザインルール

## フォント

### メインフォント
```css
font-family: 'M PLUS Rounded 1c', sans-serif;
```
- **丸ゴシック体** で絵本のような柔らかい雰囲気
- weight: 400（通常）, 700（太字）

### フォントサイズ基準
| 用途 | クラス | サイズ |
|------|--------|--------|
| 補足・ラベル | text-xs | 12px |
| 本文 | text-sm | 14px |
| サブ見出し | text-base | 16px |
| 見出し | text-lg | 18px |
| 大見出し | text-xl | 20px |

---

## 配色

### カテゴリカラー
| カテゴリ | bgClass | カラーコード |
|----------|---------|--------------|
| ベビー | bg-pink-500 | #EC4899 |
| 幼児 | bg-amber-500 | #F59E0B |
| 低学年 | bg-orange-500 | #F97316 |
| 高学年 | bg-blue-500 | #3B82F6 |

### メインカラー（オレンジ系）
| 用途 | クラス |
|------|--------|
| アクセント | text-orange-500 |
| 背景（薄） | bg-orange-50 |
| バッジ背景 | bg-orange-100 |
| グラデーション | from-orange-400 to-amber-400 |

### テキストカラー
| 用途 | クラス |
|------|--------|
| メイン | text-gray-700 |
| サブ | text-gray-500 |
| 補足 | text-gray-400 |
| 真っ黒禁止 | ~~text-black~~ |

### 背景カラー
| 用途 | クラス |
|------|--------|
| ベース | bg-white |
| 薄いオレンジ | bg-orange-50/30 |
| カード | bg-orange-50 |
| ストーリー | bg-yellow-50 |

### 区切り線
```
border-gray-100  // 極薄いグレー
border-orange-100 // 極薄いオレンジ
```

---

## コンポーネントスタイル

### カード
```css
rounded-2xl     /* 角丸16px */
shadow-sm       /* 軽い影 */
p-4             /* パディング16px */
```

### ボタン（プライマリ）
```css
bg-gradient-to-r from-orange-400 to-amber-400
text-white
font-bold
py-4
rounded-2xl
shadow-lg shadow-orange-200
```

### タグバッジ
```css
text-xs
text-orange-600
bg-orange-100
px-2 py-0.5
rounded-full
font-medium
```

### 手紙風ボックス（ストーリー）
```css
bg-yellow-50
rounded-2xl
p-5
border-2 border-yellow-200 border-dashed
```

---

## アニメーション（Framer Motion）

### スライドアニメーション
```typescript
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 0,
    }),
};

transition: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
}
```

### フェードイン
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2, duration: 0.4 }}
```

---

## 鉄の掟

1. **真っ黒禁止**: text-black は使わない。text-gray-700 を使う
2. **デカ文字禁止**: text-2xl以上は控えめに
3. **余白統一**: p-4 (16px) を基準にする
4. **角丸統一**: rounded-xl または rounded-2xl
5. **パステルカラー**: 原色ではなく-50, -100, -200 を使う
6. **絵本感**: 温かみ > かっこよさ
