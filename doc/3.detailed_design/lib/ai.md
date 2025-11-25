# 詳細設計: AI サービス層 (`lib/ai.js`)

## 概要

Google Gemini API との通信をカプセル化し、プロンプトの構築やモデルの呼び出しを行う。

## 依存関係

- `@google/generative-ai`
- `./store.js` (履歴取得のため、または呼び出し元から履歴を受け取る設計とする。ここでは疎結合のため履歴は引数で受け取る設計を推奨)

## 定数

- `MODEL_NAME`: "gemini-2.5-flash-lite"

## 関数定義

### `generateResponse(history, persona)`

- **目的**: ユーザーの入力と過去の履歴、ペルソナに基づいて AI の応答を生成する。
- **引数**:
  - `history`: Array<Object> (チャット履歴 `{ role, parts: [{ text }] }`)
  - `persona`: Object (AI ペルソナ設定)
- **戻り値**: `Promise<String>` (AI の応答テキスト)
- **ロジック**:
  1. `GoogleGenerativeAI` クライアントを初期化。
  2. システムプロンプトを構築。
     - `persona.basePersonality` を含める。
     - 現在の日時や状況を含める。
  3. `model.startChat()` でチャットセッションを開始。
  4. `sendMessage()` で最後のユーザー入力を送信（あるいは history 全体を渡す）。
  5. レスポンスからテキストを抽出して返す。

### `analyzePersonality(chatHistory)`

- **目的**: チャット履歴からユーザーの性格特性を分析する (Daydream)。
- **引数**:
  - `chatHistory`: Array<Object>
- **戻り値**: `Promise<Object>` (分析結果の JSON)
- **ロジック**:
  1. 分析用のプロンプトを構築。「以下の会話からユーザーの性格特性（開放性、誠実性など）を分析し、JSON で出力せよ」
  2. `generateContent` を呼び出す。
  3. JSON レスポンスをパースして返す。

### `synthesizeDream(dailyHistory, pastAnalysis)`

- **目的**: 1 日の履歴と過去の分析結果を統合し、AI の長期記憶（ベース性格）を更新する (Dream)。
- **引数**:
  - `dailyHistory`: Array
  - `pastAnalysis`: Array
- **戻り値**: `Promise<String>` (新しいベース性格テキスト)
