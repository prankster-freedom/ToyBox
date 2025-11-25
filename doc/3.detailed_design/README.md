# 詳細設計書 (Detailed Design)

本ディレクトリは、`ToyBox` プロジェクトの詳細設計書を格納します。
モジュールごとにファイルを分割しています。

## ディレクトリ構成

- **`lib/`**: バックエンドのコアロジック、データベースアクセス、外部 API 連携
  - [`store.md`](./lib/store.md): データアクセス層 (Cloud Datastore)
  - [`ai.md`](./lib/ai.md): AI サービス層 (Gemini API)
- **`routes/`**: API エンドポイントの定義
  - [`chat.md`](./routes/chat.md): チャット関連 API
  - [`memory.md`](./routes/memory.md): 記憶管理 API
  - [`tasks.md`](./routes/tasks.md): 非同期タスクハンドラ
- **`middleware/`**: Express ミドルウェア
  - [`auth.md`](./middleware/auth.md): 認証ミドルウェア
  - [`logger.md`](./middleware/logger.md): ロギングミドルウェア
- **`public/`**: フロントエンド
  - [`frontend.md`](./public/frontend.md): フロントエンドアーキテクチャ (Vue.js)
