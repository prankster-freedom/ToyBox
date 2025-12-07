# 詳細設計: タスクハンドラ (`routes/tasks.js`)

## 概要

Cloud Tasks や Cloud Scheduler からの非同期リクエストを処理するエンドポイント。
一般ユーザーからのアクセスは想定せず、Service Account 認証などで保護する（あるいは App Engine / Cloud Run の内部呼び出し制限を利用）。

## エンドポイント

### `POST /api/tasks/daydream`

- **トリガー**: Cloud Tasks (チャット API からエンキューされる)
- **認証**: OIDC トークン検証 (Cloud Tasks からの呼び出しであることを確認)
- **リクエストボディ**:
  ```json
  {
    "userId": "user-123",
    "isTest": true // Optional: true の場合、分析をスキップしテストデータを保存
  }
  ```
- **処理フロー**:
  1. **認証**: リクエストヘッダーの Bearer トークンを検証。
  2. **テストモード判定**: `req.body.isTest` が `true` の場合、以下の手順を実行し終了する。
     - 固定の分析結果「あなたはソフトウェアテストの専門用語が好きです」を作成。
     - `store.savePersonalityAnalysis` で保存。
     - レスポンス `200 OK` を返却。
  3. **履歴取得**: `store.getRecentChatHistory(userId)` で分析に必要な履歴を取得。
  4. **分析実行**: `ai.analyzePersonality(history)` を呼び出す。
  5. **結果保存**: 分析結果を `store.savePersonalityAnalysis` (要追加) で保存。
  6. **ペルソナ更新**: 必要であれば `store.updateAiPersona` で短期的なペルソナ調整を行う。

### `POST /api/tasks/dream`

- **トリガー**: Cloud Scheduler (毎日深夜) + Cloud Run Job
- **認証**: OIDC トークン検証
- **処理フロー**:
  1. **全ユーザー取得**: `store.getAllUserIdsActiveToday()` (要検討: 全ユーザー処理は時間がかかるため、カーソルを使ったバッチ処理が必要になる可能性あり)。
  2. **ユーザーごとの処理**:
     - その日の `PersonalityAnalysis` 結果とチャット履歴を取得。
     - `ai.synthesizeDream` を呼び出してベース性格を更新。
     - `store.updateAiPersona` で保存。
     - 古いチャット履歴や分析結果のアーカイブ/削除（必要であれば）。
