# 詳細設計: Daydream & Tasks Feature

## 1. 概要

バックグラウンドで実行される非同期タスク群。
ユーザーのチャット履歴を分析して性格特性を抽出したり (Daydream)、長期記憶として統合したり (Dream) する機能を提供する。
Cloud Tasks と Cloud Scheduler を活用して実行される。

## 2. アーキテクチャ構成

- **Triggers**:
  - **Cloud Tasks**: ユーザーの対話数が閾値を超えた時にトリガー (Daydream)。
  - **Cloud Scheduler**: 定期的（毎日深夜）にトリガー (Dream)。
  - **Manual/Dev**: `developer.html` から手動実行。
- **Backend Routes**: `routes/tasks.js` (Task Handlers)
- **Jobs**: `jobs/dream.js` (Dream Logic)
- **Service/Lib**: `lib/ai.js` (Analysis Logic), `lib/store.js` (Analysis Data)
- **Database**: Datastore (`Kind: PersonalityAnalysis`)

## 3. 主要コンポーネント詳細

### 3.1. 性格分析タスク (Daydream)

- **Handler**: `POST /api/tasks/daydream`
- **トリガー**: `routes/chat.js` からエンキューされる、または開発者ツールから呼び出される。
- **OIDC 認証**: Service Account (Cloud Tasks Invoker) からの呼び出しのみ許可する。
- **処理フロー**:
  1. **履歴取得**: 対象ユーザーの直近チャット履歴を取得。
  2. **AI 分析**: `ai.analyzePersonality(history)` を実行し、ユーザーの性格や興味関心を抽出。
  3. **保存**: 結果を `PersonalityAnalysis` エンティティとして保存。
  4. **影響**: 分析結果は、次回の `Dream` ジョブで AI ペルソナに反映される可能性がある。
- **Test Mode**: リクエストに `isTest: true` が含まれる場合、AI 分析をスキップし、固定のモックデータを保存する（コスト削減・動作テスト用）。

### 3.2. 夢・統合タスク (Dream)

- **Handler**: `POST /api/tasks/dream`
- **トリガー**:
  - Cloud Scheduler (毎日 03:00 JST)。
  - `developer.html` から手動実行 (動作テスト用)。
- **処理フロー**:
  1. アクティブな全ユーザー（またはリクエストで指定された `userId`）を取得。
  2. 各ユーザーについて、その日の `PersonalityAnalysis` 結果と会話ログを収集。
  3. `ai.synthesizePersonality` を実行し、AI ペルソナの `basePersonality` を微調整・更新する。
  4. 「昨日は〇〇の話で盛り上がった」といった長期記憶を形成する。

## 4. データモデル (Datastore: PersonalityAnalysis)

| Property    | Type        | Description           |
| :---------- | :---------- | :-------------------- |
| `user_uid`  | String      | User ID               |
| `traits`    | JSON/Object | 抽出された性格特性    |
| `summary`   | String      | 分析サマリー          |
| `timestamp` | Date        | 分析日時              |
| `type`      | String      | "daydream" or "dream" |
