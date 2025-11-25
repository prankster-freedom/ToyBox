# `lib/store.js` - 初学者向けのコードレベルの解説

このファイルは、アプリケーションのデータベース処理を全て担当するモジュールです。Google Cloud Datastoreを使用して、ユーザー情報、AIのペルソナ、チャット履歴などのデータを永続化（保存）します。

## 概要

`store.js`は、データベースとのやり取りを抽象化し、他のファイル（主にAPIルート）が具体的なデータベースの操作を意識することなく、「ユーザーを保存する」「チャット履歴を取得する」といった操作を簡単に行えるようにします。

### Datastoreの基本用語

-   **Datastore**: Google Cloudが提供するNoSQLデータベースサービスです。
-   **Kind**: データの種類を表すもので、リレーショナルデータベース（RDB）の「テーブル」に似ています。このファイルでは `User`, `AiPersona`, `ChatMessage`, `PersonalityAnalysis` の4つのKindを扱います。
-   **Key**: Kind内の各データを一意に識別するためのものです。RDBの「プライマリキー」に相当します。
-   **Entity**: 1つのデータレコードそのものです。Keyとプロパティ（データの集まり）で構成されます。RDBの「行」に似ています。

## コード解説

```javascript
import { Datastore } from '@google-cloud/datastore';
import { enter, exit, log } from './logger.js';

const datastore = new Datastore();

const KIND_USER = 'User';
const KIND_AI_PERSONA = 'AiPersona';
const KIND_CHAT_MESSAGE = 'ChatMessage';
const KIND_PERSONALITY_ANALYSIS = 'PersonalityAnalysis';

// ... 各種関数 ...
```

最初に、Datastoreクライアントを初期化し、使用するKindの名前を定数として定義しています。

---

### ユーザー (Users)

#### `saveUser(user)`

Google認証後に取得したユーザー情報をDatastoreに保存・更新します。

```javascript
export async function saveUser(user) {
  // ...
  const key = datastore.key([KIND_USER, user.id]);
  const entity = {
    key: key,
    data: { /* ... user data ... */ },
  };
  await datastore.save(entity);
  // ...
}
```

-   `datastore.key([KIND_USER, user.id])` で、`User` Kindの中に`user.id`をキーとする一意なKeyを作成します。
-   `datastore.save()` は、指定されたKeyを持つエンティティが存在すれば更新し、なければ新規作成します（Upsert）。

---

### AIペルソナ (AiPersonas)

#### `getAiPersona(userId)`

ユーザーごとのAIペルソナ設定を取得します。データがまだ存在しない場合は、デフォルト値を返します。

#### `updateAiPersona(userId, data)`

AIペルソナの情報を更新します。既存のデータと新しいデータをマージして保存します。

#### `incrementInteractionCount(userId)`

ユーザーとAIの対話回数を1つ増やします。複数のリクエストが同時に来ても安全にカウンターを更新するため、**トランザクション**を使用しています。

```javascript
export async function incrementInteractionCount(userId) {
  // ...
  const transaction = datastore.transaction();
  try {
    await transaction.run();
    const [persona] = await transaction.get(key); // データを読み取り
    // ... カウントを増やす処理 ...
    transaction.save(entity); // データを保存
    await transaction.commit(); // トランザクションを確定
    // ...
  } catch (err) {
    await transaction.rollback(); // エラー時は変更を破棄
    // ...
  }
}
```

---

### チャットメッセージ (Chat Messages)

#### `saveChatMessage(userId, role, content)`

ユーザーとAIの会話メッセージを1件保存します。

#### `getRecentChatHistory(userId, limit = 10)`

指定されたユーザーの最新のチャット履歴を`limit`件数だけ取得します。

```javascript
export async function getRecentChatHistory(userId, limit = 10) {
  // ...
  const query = datastore.createQuery(KIND_CHAT_MESSAGE)
    .filter('user_uid', '=', userId)
    .order('timestamp', { descending: true })
    .limit(limit);
  // ...
}
```
-   `createQuery()` でクエリを作成し、`filter()`で特定ユーザーのメッセージに絞り込み、`order()`でタイムスタンプの降順（新しい順）に並べ替え、`limit()`で件数を制限しています。

#### `getChatHistoryForDay(userId, date)`

特定の日付のチャット履歴を全て取得します。

---

### データ削除 (Delete All Data)

#### `deleteUserData(userId)`

指定されたユーザーに関連する全てのデータを削除します。

-   `User`と`AiPersona`は`userId`がキーになっているため、キーを直接指定して削除します。
-   `ChatMessage`と`PersonalityAnalysis`は`userId`をプロパティとして持つため、まずクエリで該当するデータのキーを全て取得し、そのキーのリストを使って一括で削除します。`select('__key__')`を使うことで、データ全体を読み込まずにキーだけを効率的に取得できます。

---

### ユーティリティ (Utility)

#### `getAllUserIdsActiveToday()`

（デモ・バッチ処理用）現在登録されている全てのユーザーIDを取得します。本番環境では負荷が高くなる可能性があるため、注意が必要な実装です。
