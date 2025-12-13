# 実装詳細: routes/api.js

## 概要

API ルートのメインエントリーポイント。
各機能モジュールのルーター (`chat`, `posts`, `health`, `tasks`, `store`, `greet`) を統合する。

## 依存関係

```mermaid
flowchart TD
    %% Dependencies
    api["routes/api.js"] -->|Mounts| chat["routes/chat.js"]
    api -->|Mounts| posts["routes/posts.js"]
    api -->|Mounts| health["routes/health.js"]
    api -->|Mounts| tasks["routes/tasks.js"]
    api -->|Mounts| store["routes/store.js"]
    api -->|Mounts| greet["routes/greet.js"]
    api -->|Uses| logger["lib/logger.js"]
    api -->|Uses| reqLog["middleware/requestLogger.js"]
    api -->|Uses| resLog["middleware/responseLogger.js"]

    %% Consumers
    index["index.js"] -->|Uses /api| api
```

## 設定詳細

### Middleware Setup

- `requestLogger`: 全 API リクエストに対して事前に実行。
- `responseLogger`: 全 API レスポンス送信後に実行。

### Route Mounting

- `/health`: `healthRouter`
- `/chat`: `chatRouter`
- `/posts`: `postsRouter`
- `/tasks`: `tasksRouter`
- `/store`: `storeRouter`
- `/greet`: `greetRouter`

### 404 Handler

- 定義されたルート以外のアクセスに対し、`404 Not Found` (JSON) を返すハンドラーを末尾に配置。
