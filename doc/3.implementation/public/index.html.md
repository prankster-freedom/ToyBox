# 実装ドキュメント: public/index.html

## 概要

アプリケーションのメインエントリーポイントとなる HTML ファイル。言語切り替え、認証オーバーレイ、チャット UI、コレクション UI の構造を定義する。

## 依存関係 (Mermaid)

```mermaid
flowchart TD
    index["public/index.html"]
    style["public/css/style.css"]
    script["public/script.js"]
    google_fonts["Google Fonts (Quicksand, Zen Maru Gothic)"]
    google_logo["Google Identity Image"]

    index --> style
    index --> script
    index --> google_fonts
    index --> google_logo
```

### Dependencies

- `public/css/style.css`: スタイリング
- `public/script.js`: アプリケーションロジック
- `Google Fonts`: タイポグラフィ

### Consumers

- エンドユーザー（ブラウザ）

## 構造

- `flower-bg`: 背景アニメーション
- `lang-switch`: 言語切り替えボタン
- `auth-overlay`: ログインカード
- `nav-header`: シーン切り替えナビゲーション
- `viewport`: メインコンテンツ領域
  - `scene-chat`: 3D チャットストリーム
  - `scene-diary`: コレクション（石碑）
- `input-dock`: 共通入力エリア
