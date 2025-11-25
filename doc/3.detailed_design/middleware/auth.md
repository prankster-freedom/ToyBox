# 詳細設計: 認証ミドルウェア (`middleware/auth.js`)

## 概要

リクエストの認証状態を確認し、保護されたルートへのアクセスを制御する。

## 依存関係

- `passport` (Google Strategy)
- `express-session`

## 関数定義

### `isAuthenticated(req, res, next)`

- **目的**: ユーザーがログインしているか確認する。
- **処理**:
  1. **開発モード (`NODE_ENV !== 'production'`) の場合**:
     - 認証をバイパスする。
     - `req.user` にモックユーザー情報をセットする。
     - `next()` を呼び出す。
  2. **本番モードの場合**:
     - `req.isAuthenticated()` (Passport が提供) をチェック。
     - true なら `next()`。
     - false なら `401 Unauthorized` を返す。

### `mockAuthMiddleware(req, res, next)`

- **目的**: 開発用のモックユーザーを注入する。
- **処理**:
  - `req.user` が未定義の場合、以下のオブジェクトをセット。
    ```javascript
    {
      id: 'mock-user-id',
      displayName: 'Mock User',
      photos: [{ value: 'https://via.placeholder.com/150' }]
    }
    ```
