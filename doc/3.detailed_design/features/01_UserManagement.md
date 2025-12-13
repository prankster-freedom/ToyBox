# 詳細設計: User Management Feature

## 1. 概要

ユーザーの登録、認証、プロファイル管理、およびアカウント削除機能を提供する。
Google アカウントを使用した OAuth 2.0 認証を主軸とし、セッション管理を行う。

## 2. アーキテクチャ構成

- **Frontend**: ログインボタン (`/auth/google`), ユーザー情報表示 (`/user`)
- **Backend Routes**: `routes/auth.js`, `routes/store.js` (User API)
- **Middleware**: `middleware/auth.js` (`isAuthenticated`)
- **Lib/Service**: `lib/store.js` (User Data Access)
- **Database**: Google Cloud Datastore (`Kind: User`)

## 3. 主要コンポーネント詳細

### 3.1. 認証フロー (`routes/auth.js`)

- **GET /auth/google**: Passport.js を使用して Google 認証画面へリダイレクト。
- **GET /auth/google/callback**: 認証成功後、ユーザー情報を取得しセッションを確立。
  - 成功時: `/` (トップページ) へリダイレクト。
  - 失敗時: `/login` へリダイレクト。
- **GET /logout**: セッションを破棄しログアウトする。

### 3.2. 認証ミドルウェア (`middleware/auth.js`)

- **`isAuthenticated(req, res, next)`**:
  - 本番環境 (`production`): `req.isAuthenticated()` でセッション有効性を確認。無効なら `401 Unauthorized`。
  - 開発環境 (`development`) / ローカル: 認証をバイパスし、モックユーザー (`req.user`) を注入して `next()` させる。

### 3.3. ユーザーデータ管理 (`lib/store.js`)

- **`saveUser(user)`**:
  - Google プロファイル情報 (ID, DisplayName, Photos) を Datastore に Upsert する。
  - ログイン成功時に `passport.deserializeUser` 等から呼び出されることを想定。
- **`deleteUserData(userId)`**:
  - GDPR/プライバシー対応としての「忘れられる権利」実装。
  - 指定ユーザー ID に関連する全データ (User entity, Chat logs, AI Persona, Analysis results) を物理削除する。

### 3.4. API エンドポイント

- **GET /user**: 現在ログイン中のユーザー情報を JSON で返す。
- **GET /api/health**: ヘルスチェック (認証不要)。

## 4. データモデル (Datastore: User)

| Property      | Type   | Description               |
| :------------ | :----- | :------------------------ |
| `id` (Key)    | String | Google User ID            |
| `displayName` | String | 表示名                    |
| `photos`      | Array  | アイコン画像の URL リスト |
| `created`     | Date   | 作成日時 (Optional)       |
