# 実装ドキュメント: public/css/style.css

## 概要

ToyBox アプリケーションの全体的なデザインとレイアウトを定義するスタイルシート。3D チャット UI、コレクション UI、およびモバイルレスポンシブ対応を含む。

## 依存関係 (Mermaid)

```mermaid
flowchart TD
    style["public/css/style.css"]
    index["public/index.html"]
    google_fonts["Google Fonts (Quicksand, Zen Maru Gothic)"]

    style -- "Loaded by" --> index
    style -- "Imports" --> google_fonts
```

### Dependencies

- `Google Fonts`: デザインシステムで使用するフォント。

### Consumers

- `public/index.html`: 全体的なスタイリング。

## 主要なデザイン要素

- **カラーパレット**: `--primary-bg`, `--accent-gold`, `--accent-rose` 等の変数で管理。
- **オーバーフロー制御 (Issue #2 の修正)**:
  - `html, body`: `overflow-x: hidden` により、不測の横揺れを防止。
  - `body`: `width: 100%` を使用し、100vw 指定時のスクロールバーによる幅の超過を回避。
  - `.flower-bg`: `overflow: hidden` により、アニメーションする花びら要素がドキュメント幅を広げないようクリッピング。
- **3D UI (Issue #5 関連)**:
  - `.curved-stream`: `transform-style: preserve-3d` を維持。
  - `.card`: `will-change: transform, opacity` による最適化。
- **レスポンシブ対応**:
  - `@media (max-width: 600px)`: モバイル環境での `auth-card` のサイズ縮小、ボタンの全幅化、ナビゲーションの最適化。
