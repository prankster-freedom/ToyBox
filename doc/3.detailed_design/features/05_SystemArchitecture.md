# 詳細設計: System Architecture & Infrastructure

## 1. 概要

アプリケーション全体の基盤となる共通機能、ミドルウェア、およびインフラ構成について記述する。

## 2. サーバー構成

- **Runtime**: Node.js (Express)
- **Hosting**: Google Cloud Run
- **Entry Point**: `index.js`

## 3. ミドルウェア構成

リクエスト処理パイプラインは以下の順序で構成される。

1.  **Request Logger** (`middleware/requestLogger.js`):
    - 全リクエストの Method, URL, IP 等を記録。
2.  **Static Files**:
    - `public/` ディレクトリ配下を配信。
3.  **Body Parser**:
    - JSON および URL-encoded データのパース。
4.  **Session & Auth** (`passport`, `express-session`):
    - ユーザーセッションの維持。
    - `Security Middleware` (`middleware/auth.js`) によるルート保護。
5.  **Routes**:
    - API 群 (`/api/*`)、認証ルート (`/auth/*`)。
6.  **Response Logger** (`middleware/responseLogger.js`):
    - レスポンス送信完了時にステータスコードや処理時間を記録。
7.  **Error Handling**:
    - 未捕捉エラーのロギングと、適切なエラーレスポンス (JSON `500` 等) の返却。

## 4. ロギング (`lib/logger.js`)

- **JSON 構造化ログ**: Cloud Logging での解析を容易にするため、ログは JSON 形式で出力する。
- **Severity Levels**: `INFO`, `WARN`, `ERROR`, `DEBUG`。
- **Traceability**: リクエスト ID や関数名をログに含め、処理の流れを追跡可能にする (`enter`, `exit`, `log` 関数を提供)。

## 5. ヘルスチェック (`routes/health.js`)

- **GET /api/health**:
  - アプリケーションが稼働中であることを示す `200 OK` を返す。
  - Cloud Run のロードバランサ等からの生存確認に使用される。

## 6. インフラ設定

- **Cloud Run**:
  - `min-instances`: 0 (コスト最適化) ~ N
  - `concurrency`: 80
- **Cloud Build**:
  - GitHub への Push をトリガーに CI/CD パイプラインが実行され、自動デプロイされる (`cloudbuild.yaml`)。
