# 詳細設計: チャット API (`routes/chat.js`)

## 概要

AI との対話機能を提供する API エンドポイント。

## エンドポイント

### `POST /api/chat`

- **認証**: 必須 (`isAuthenticated`)
- **リクエストボディ**:
  ```json
  {
    "message": "こんにちは",
    "isAutoTrigger": false
  }
  ```
- **レスポンス**:
  ```json
  {
    "reply": "こんにちは！今日はいい天気ですね。"
  }
  ```

## 処理フロー

1. **認証チェック**: ミドルウェアでログイン済みか確認。
2. **入力検証**: `message` が空でないか確認（`isAutoTrigger` が true の場合は空でも可）。
3. **コンテキスト取得**:
   - `store.getAiPersona(userId)` でペルソナを取得。
   - `store.getRecentChatHistory(userId)` で直近の履歴を取得。
4. **AI 応答生成**:
   - `ai.generateResponse(history, persona)` を呼び出す。
5. **保存**:
   - ユーザーのメッセージを `store.saveChatMessage` で保存。
   - AI の応答を `store.saveChatMessage` で保存。
6. **Daydream トリガー判定**:
   - `store.incrementInteractionCount(userId)` を呼び出す。
   - カウントが閾値（例: 10 回）を超えた場合、Cloud Tasks に分析タスクをエンキューする（非同期処理）。
     - `tasks.enqueueDaydreamTask(userId)` (新規作成が必要かも)
7. **レスポンス返却**: AI の応答を JSON で返す。
