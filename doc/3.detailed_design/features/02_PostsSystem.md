# 詳細設計: Posts System Feature

## 1. 概要

ユーザーがテキストコンテンツを投稿し、閲覧、削除できる基本的な掲示板/SNS 機能を提供する。
認証済みユーザーのみが投稿・削除を行える。

## 2. アーキテクチャ構成

- **Frontend**: 投稿一覧表示, 新規投稿フォーム (developer.html 等)
- **Backend Routes**: `routes/posts.js`
- **Lib/Service**: `lib/posts.js`
- **Database**: Google Cloud Datastore (`Kind: Post`)

## 3. 主要コンポーネント詳細

### 3.1. 投稿管理ロジック (`lib/posts.js`)

- **`getPosts()`**:
  - 全投稿を作成日時の降順で取得する (最大 10 件等の制限を入れる場合あり)。
  - 各投稿には `id`, `title`, `content`, `createdAt` が含まれる。
- **`getPost(id)`**:
  - 指定された ID の投稿を取得する。
- **`createPost(data)`**:
  - 新しい投稿を作成する。
  - `data` には `title`, `content` が含まれることが期待される。
- **`deletePost(id)`**:
  - 指定された ID の投稿を削除する。

### 3.2. API エンドポイント (`routes/posts.js`)

- **GET /api/posts**: 投稿一覧を取得。
- **GET /api/posts/:id**: 指定 ID の投稿を取得。
- **POST /api/posts**: 新規投稿を作成 (要認証)。
  - Body: `{ title: "...", content: "..." }`
- **DELETE /api/posts/:id**: 指定 ID の投稿を削除 (要認証)。

## 4. データモデル (Datastore: Post)

| Property    | Type           | Description         |
| :---------- | :------------- | :------------------ |
| `id` (Key)  | Integer/String | 自動生成 ID         |
| `title`     | String         | タイトル (Optional) |
| `content`   | String         | 本文                |
| `createdAt` | Date           | 投稿日時            |
