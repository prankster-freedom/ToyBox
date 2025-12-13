# 詳細設計: Chat & AI Interaction Feature

## 1. 概要

Google Gemini API を活用した AI との対話機能、およびペルソナ（AI の人格）管理機能を提供する。
ユーザーのメッセージと過去の会話履歴に基づいて、一貫性のある応答を生成する。

## 2. アーキテクチャ構成

- **Frontend**: チャット画面, メッセージ送信
- **Backend Routes**: `routes/chat.js` (対話), `routes/store.js` (履歴・ペルソナ管理), `routes/greet.js` (挨拶)
- **Service/Lib**: `lib/ai.js` (Gemini API Wrapper), `lib/store.js` (History/Persona Data)
- **Database**: Google Cloud Datastore (`Kind: ChatMessage`, `Kind: AiPersona`)

## 3. 主要コンポーネント詳細

### 3.1. AI サービス (`lib/ai.js`)

- **`generateResponse(history, persona)`**:
  - `GoogleGenerativeAI` SDK を使用してレスポンスを生成する。
  - **System Prompt**: `persona.basePersonality` をベースに構築し、現在時刻などのコンテキストを含める。
  - **Chat Session**: 履歴 (`history`) を渡してセッションを開始し、文脈を維持した応答を得る。

### 3.2. チャット API (`routes/chat.js`)

- **POST /api/chat**:
  1. **認証**: ログインユーザーのみアクセス可。
  2. **履歴・ペルソナ取得**: `store.getRecentChatHistory(userId)` と `store.getAiPersona(userId)` を取得。
  3. **応答生成**: `ai.generateResponse` を呼び出す。
  4. **保存**: ユーザーメッセージと AI 応答をそれぞれ `ChatMessage` として保存。
  5. **トリガー判定**: `interactionCount` をインクリメントし、閾値を超えたら分析タスク (`Daydream`) をエンキューする（下記 `04_DaydreamTasks.md` 参照）。

### 3.3. 挨拶 API (`routes/greet.js` / `lib/greet.js`)

- **POST /api/greet**:
  - シンプルな挨拶ロジック、あるいは軽量な AI 呼び出しを行う（現状の実装に即して記述）。

### 3.4. ペルソナ・履歴管理 (`lib/store.js`)

- **Kinds**:
  - `AiPersona`: ユーザーごとの AI 設定（ベース性格、口調、記憶など）。`user_uid` で紐づけ。
  - `ChatMessage`: Role (user/model), Content, Timestamp を保持。時系列順に取得してコンテキストとして利用。

## 4. データモデル (Datastore)

### AiPersona

| Property           | Type    | Description                 |
| :----------------- | :------ | :-------------------------- |
| `user_uid`         | String  | User ID                     |
| `basePersonality`  | String  | 基本性格プロンプト          |
| `metrics`          | Object  | 各種パラメータ (親密度など) |
| `interactionCount` | Integer | 対話回数カウンタ            |

### ChatMessage

| Property    | Type   | Description       |
| :---------- | :----- | :---------------- |
| `user_uid`  | String | User ID           |
| `role`      | String | "user" or "model" |
| `content`   | String | メッセージ本文    |
| `timestamp` | Date   | 送信日時          |
