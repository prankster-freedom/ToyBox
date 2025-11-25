# 詳細設計: データアクセス層 (`lib/store.js`)

## 概要

Google Cloud Datastore へのアクセスをカプセル化し、アプリケーションの他の部分からデータベースの実装詳細を隠蔽する。

## 依存関係

- `@google-cloud/datastore`
- `./logger.js`

## 定数 (Kinds)

- `KIND_USER`: "User"
- `KIND_AI_PERSONA`: "AiPersona"
- `KIND_CHAT_MESSAGE`: "ChatMessage"
- `KIND_PERSONALITY_ANALYSIS`: "PersonalityAnalysis"

## 関数定義

### ユーザー管理

#### `saveUser(user)`

- **目的**: ユーザー情報を保存または更新する (Upsert)。
- **引数**:
  - `user`: Object (Google Profile Object)
    - `id`: String (Google ID)
    - `displayName`: String
    - `photos`: Array
    - ...
- **戻り値**: `Promise<void>`
- **ロジック**:
  1. `User` Kind の Key を作成 (`user.id` を使用)。
  2. エンティティを作成し、`save` メソッドで保存。

### AI ペルソナ管理

#### `getAiPersona(userId)`

- **目的**: ユーザーごとの AI ペルソナを取得する。
- **引数**:
  - `userId`: String
- **戻り値**: `Promise<Object>`
  - 存在しない場合はデフォルト値を返す。
  - デフォルト値: `{ basePersonality: "...", interactionCount: 0 }`

#### `updateAiPersona(userId, data)`

- **目的**: AI ペルソナを更新する。
- **引数**:
  - `userId`: String
  - `data`: Object (更新するフィールド)
- **戻り値**: `Promise<void>`
- **ロジック**:
  1. 既存データを取得。
  2. 引数の `data` でマージ。
  3. 保存。

#### `incrementInteractionCount(userId)`

- **目的**: `interactionCount` をアトミックにインクリメントする。
- **引数**:
  - `userId`: String
- **戻り値**: `Promise<number>` (新しいカウント値)
- **ロジック**:
  1. Datastore トランザクションを開始。
  2. 現在の `AiPersona` を取得。
  3. `interactionCount` を +1。
  4. 保存してコミット。

### チャット履歴管理

#### `saveChatMessage(userId, role, content)`

- **目的**: チャットメッセージを保存する。
- **引数**:
  - `userId`: String
  - `role`: String ("user" | "model")
  - `content`: String
- **戻り値**: `Promise<void>`
- **ロジック**:
  1. `ChatMessage` Kind のエンティティを作成。
  2. `timestamp` に現在時刻を設定。
  3. 保存。

#### `getRecentChatHistory(userId, limit = 10)`

- **目的**: 直近のチャット履歴を取得する。
- **引数**:
  - `userId`: String
  - `limit`: Number (デフォルト 10)
- **戻り値**: `Promise<Array>`
- **ロジック**:
  1. `ChatMessage` Kind に対してクエリを作成。
  2. `user_uid` でフィルタ。
  3. `timestamp` 降順でソート。
  4. `limit` 件取得。
  5. 昇順（古い順）に並べ替えて返す（会話コンテキストとして使いやすくするため）。

### データ削除

#### `deleteUserData(userId)`

- **目的**: ユーザーに関連する全データを削除する (GDPR/プライバシー対応)。
- **引数**:
  - `userId`: String
- **戻り値**: `Promise<void>`
- **ロジック**:
  1. `User`, `AiPersona` は Key 指定で削除。
  2. `ChatMessage`, `PersonalityAnalysis` はクエリで Key を取得し、バッチ削除 (`delete(keys)`).
