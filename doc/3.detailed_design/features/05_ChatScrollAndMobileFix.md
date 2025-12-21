# 詳細設計: Issue #5 (スクロール) & Issue #2 (スマホ表示修正)

## 1. 目的

- 3D カーブ UI を維持したまま、マウスホイールやタッチ操作によるスクロール（過去ログの閲覧）を可能にする。
- スマートフォン（Pixel 7 Pro 等）での表示ズーム不具合を修正し、レスポンシブな全体表示を実現する。

## 2. スクロール機能の設計 (Issue #5)

### 2.1. 状態管理

`scrollOffset` (number, 初期値 0) を導入し、描画ロジックのベース座標を移動させます。

### 2.2. イベント処理

- **Mouse Wheel**: `wheel` イベントを捕捉し、`deltaY` を `scrollOffset` に加算。
- **Touch**: `touchstart`, `touchmove` を捕捉。前回のタッチ座標との差分を `scrollOffset` に反映。
- **限界値設定**: 最新のメッセージが画面下部に留まる位置から、最古のメッセージが画面中央付近に現れる位置までの範囲で `scrollOffset` をクランプ（制限）します。

### 2.3. 描画ロジックの更新

`renderChat` 関数内での各カードの Y 座標計算式を変更します。

```javascript
// Before
let targetBottomY = safeBottomY - reverseIndex * visualSpacing;

// After
// scrollOffset は正の値で「過去に遡る」挙動とする
let targetBottomY = safeBottomY - reverseIndex * visualSpacing + scrollOffset;
```

## 3. モバイル表示の修正設計 (Issue #2)

### 3.1. Viewport 設定

ズーム不具合の主要因となる Viewport 設定を標準的なものに固定します。

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
/>
```

### 3.2. CSS 戦略

- **Box Model**: すべての要素に `box-sizing: border-box` を適用し、内側の余白が幅計算を狂わせないようにします。
- **Height**: `100vh` ではなく `100dvh` を使用し、モバイルブラウザのアドレスバーによる隠れを防止します。
- **幅の制限**: `body` やメインコンテナーに `overflow-x: hidden` を適用し、横方向の不要なスクロールを抑制します。カードの `width: 60%` かつ `min-width: 300px` 設定が、画面幅 (例: 360px) に対して適切かを確認し、必要に応じてメディアクエリで調整します。

## 4. プロトタイプ反映計画

`doc/3.detailed_design/frontend_chat_log_dynamic_image.html` に対して上記のロジックを実装し、ブラウザ上で動作検証を行います。
