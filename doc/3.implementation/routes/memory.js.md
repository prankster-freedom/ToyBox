# `routes/memory.js` - 初学者向けのコードレベルの解説

このファイルは、ユーザーの全てのデータを削除するためのAPIエンドポイントを定義します。具体的には、`DELETE /api/memory` というリクエストを受け取ったときの処理を記述しています。

## 概要

このルーターの主な役割は以下の通りです。

1.  **認証チェック**: リクエストが認証されたユーザーからのものであることを確認します。
2.  **データ削除**: 認証されたユーザーに関連する全てのデータ（ユーザー情報、AIペルソナ、チャット履歴など）をデータベースから削除します。
3.  **結果の返却**: 削除が成功したか、失敗したかに応じて適切なHTTPステータスコードを返します。

## コード解説

```javascript
import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { deleteUserData } from '../lib/store.js';
import { enter, exit, log } from '../lib/logger.js';

const router = express.Router();

router.delete('/', isAuthenticated, async (req, res) => {
    const functionName = 'DELETE /api/memory';
    enter(functionName, { userId: req.user.id });

    try {
        await deleteUserData(req.user.id);
        res.status(204).send();
        exit(functionName, { result: 'success' });
    } catch (error) {
        log('ERROR', functionName, error);
        res.status(500).json({ error: 'Failed to delete memory' });
    }
});

export default router;
```

### 1. `import`文

-   `express`: WebフレームワークであるExpressを読み込みます。
-   `isAuthenticated`: `../middleware/auth.js` から、ユーザーがログインしているかを確認するミドルウェアを読み込みます。
-   `deleteUserData`: `../lib/store.js` から、指定されたユーザーIDの全データを削除する関数を読み込みます。
-   `enter`, `exit`, `log`: `../lib/logger.js` から、処理の開始、終了、エラーなどを記録するためのログ関数を読み込みます。

### 2. `router.delete('/', isAuthenticated, async (req, res) => { ... })`

`api.js` で `/memory` というパスにこのルーターが割り当てられているため、このコードは `DELETE /api/memory` というリクエストに対する処理を定義します。

-   **`router.delete('/')`**: HTTPの`DELETE`メソッドで、このルーターのルートパス (`/`) へのリクエストを処理します。
-   **`isAuthenticated`**: リクエストを処理する前に実行されるミドルウェアです。ここでユーザーが認証済みかどうかがチェックされ、認証されていなければ処理は中断され、`401 Unauthorized`エラーが返されます。
-   **`async (req, res) => { ... }`**: 実際の処理を行う関数です。`async`キーワードがついているため、関数内で`await`を使って非同期処理（ここではデータベースからのデータ削除）を待つことができます。
    -   `req`: リクエストに関する情報（`req.user` には認証されたユーザーの情報が入っています）を持つオブジェクトです。
    -   `res`: レスポンスを返すためのメソッド（`res.status()`や`res.send()`など）を持つオブジェクトです。

### 3. `try...catch` ブロック

-   **`try { ... }`**: データ削除処理を試みます。
    -   `await deleteUserData(req.user.id);`: `store.js`の`deleteUserData`関数を呼び出し、ログイン中のユーザーID (`req.user.id`) に関連する全てのデータを削除します。`await`があるため、削除処理が完了するまでここで待ちます。
    -   `res.status(204).send();`: 削除が成功したら、HTTPステータスコード`204 No Content`を返します。これは「処理は成功したが、返すコンテンツはない」という意味で、`DELETE`リクエストの成功応答としてよく使われます。
-   **`catch (error) { ... }`**: `try`ブロック内でエラーが発生した場合に実行されます。
    -   `log('ERROR', ...)`: エラー内容をログに記録します。
    -   `res.status(500).json({ error: 'Failed to delete memory' });`: クライアント（フロントエンド）に対し、HTTPステータスコード`500 Internal Server Error`とエラーメッセージをJSON形式で返します。

### 4. `export default router;`

設定したルーターオブジェクトを、他のファイル（主に`api.js`）から`import`して使えるようにエクスポートします。
