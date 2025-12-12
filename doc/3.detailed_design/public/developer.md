# 詳細設計: 開発者コンソール (`public/developer.html`)

## 概要

`public/developer.html` は、バックエンド API の動作確認やデバッグを行うための開発者専用ツールです。
SPA (`index.html`) とは独立した単純な HTML ファイルとして実装され、認証済みの状態で各 API を直接呼び出すことができます。

## アーキテクチャ

- **フレームワーク**: なし (Vanilla HTML/JS)
- **スタイル**: 埋め込み CSS (Simple styling)
- **スクリプト**: `developer.js` (API 呼び出しロジック)

## 機能一覧

### 1. API 実行とレスポンス表示

各 API エンドポイントごとに以下の UI を提供します。

- **メソッド/パス**: API の識別情報
- **説明**: 機能の概要
- **パラメータ入力**: URL パラメータ、クエリパラメータ、リクエストボディの入力フォーム
- **実行ボタン**: `fetch` API を使用してリクエストを送信
- **レスポンス表示**: 結果の JSON などを `<pre>` タグ内に整形して表示

### 2. サポートするエンドポイント

- **User**: `GET /user`, `POST /api/store/users`, `DELETE /api/store/users/:userId`
- **Posts**: `GET /api/posts`, `POST /api/posts`, `DELETE /api/posts/:id`
- **Chat**: `POST /api/chat`, `POST /api/store/chat-messages`, `GET /api/store/chat-messages`
- **AI Persona**: `GET /api/store/ai-personas/:userId`, `POST /api/store/ai-personas/:userId`
- **Tasks**: `POST /api/tasks/daydream` (Test Mode 対応)
- **[NEW] Analysis**: `GET /api/store/analyses/:userId`

## 新機機能: Personality Analysis View

Daydream/Dream 機能によって生成・保存された性格分析結果 (`PersonalityAnalysis` Entity) を確認するためのビューを追加します。

### UI 仕様

- **セクション**: `Store API (Datastore)` 配下に追加
- **インプット**:
  - `userId`: 分析対象のユーザー ID
  - `limit`: 取得件数 (Query Parameter, default: 5)
- **挙動**:
  - 実行ボタン押下で `GET /api/store/analyses/:userId?limit={limit}` をコール
  - レスポンス (JSON 配列) を表示エリアに出力
