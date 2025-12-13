# 実装詳細: routes/tasks.js

## 概要

Google Cloud Tasks や Cloud Scheduler から呼び出される非同期タスクハンドラ。
ユーザー性格分析 (Daydream) などを実行する。
Service Account 認証または内部呼び出し制限によって保護されるべきルート。

## 依存関係

```mermaid
flowchart TD
    %% Dependencies
    tasks["routes/tasks.js"] -->|Uses| logger["lib/logger.js"]
    tasks -->|Uses| store["lib/store.js"]
    tasks -->|Uses| ai["lib/ai.js"]

    %% Consumers
    api["routes/api.js"] -->|Mounts /tasks| tasks
    chat["routes/chat.js"] -.->|Triggers| tasks
    scheduler["Cloud Scheduler / Cloud Tasks"] -->|Calls POST /api/tasks/*| tasks
```

## エンドポイント詳細

### `POST /daydream`

- **説明**: ユーザーのチャット履歴を分析し、性格分析結果を保存する。
- **認証**: 本来は OIDC トークン検証が必要 (現状の実装では省略されている場合あり)。
- **Body**:
  ```json
  {
    "userId": "user-123",
    "isTest": false
  }
  ```
- **処理フロー**:
  1. `userId` がなければ 400 エラー。
  2. `isTest` が `true` の場合:
     - AI 呼び出しをスキップ。
     - 固定のモックデータを `store.savePersonalityAnalysis` で保存 (`type: 'daydream'`)。
     - 200 OK を返す。
  3. テストモードでない場合:
     - `store.getRecentChatHistory(userId, 10)` で直近 10 件の履歴を取得。
     - 履歴がなければ "No history" として終了。
     - `ai.analyzePersonality(history)` を実行。
     - 結果を `store.savePersonalityAnalysis` で保存。
     - 200 OK を返す。
  4. エラー時は 500 エラーをログ出力して返す。
