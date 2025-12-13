# 詳細設計書 (Detailed Design)

本ディレクトリは、`ToyBox` プロジェクトの詳細設計書を格納します。
設計は**機能単位 (Feature-based)** に分割され、`features/` ディレクトリに格納されています。

各機能の設計書では、その機能を実現するために必要なフロントエンド、バックエンド API、データベースモデル、および外部サービス連携について横断的に記述しています。

## ディレクトリ構成

### `features/`

アプリケーションの主要機能ごとの設計詳細です。

- **[01_UserManagement.md](./features/01_UserManagement.md)**
  - ユーザー登録、OAuth 2.0 認証、プロファイル管理、アカウント削除（忘れられる権利）。
- **[02_PostsSystem.md](./features/02_PostsSystem.md)**
  - 投稿（Post）の作成、閲覧、削除機能。基本的な CRUD 操作。
- **[03_ChatAndAI.md](./features/03_ChatAndAI.md)**
  - Google Gemini API を利用した AI チャット、挨拶機能、AI ペルソナ管理、会話履歴の保存。
- **[04_DaydreamTasks.md](./features/04_DaydreamTasks.md)**
  - 非同期タスク処理。Cloud Tasks による性格分析 (Daydream) と Cloud Scheduler による記憶統合 (Dream)。
- **[05_SystemArchitecture.md](./features/05_SystemArchitecture.md)**
  - システム全体のアーキテクチャ。サーバー構成 (Cloud Run)、ミドルウェア (Log, Auth)、ヘルスチェック。

---

_実装レベルのファイル対照表については `../3.implementation/` を参照してください。_
