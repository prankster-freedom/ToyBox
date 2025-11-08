# 要求仕様書 (SPEC.md)

## 1. 概要
モダンな技術スタックを利用したサンプルとして、認証機能付きのシンプルなブログアプリケーションを構築する。

## 2. アクター
*   **ゲスト:** 認証していない匿名ユーザー
*   **ユーザー:** Googleアカウントで認証済みのユーザー

## 3. 機能要求 (FR)
*   **FR1: ユーザー認証**
    *   FR1-1: ユーザーはGoogleアカウントを利用して認証できる。
    *   FR1-2: ユーザーはログアウトできる。
*   **FR2: 投稿の管理**
    *   FR2-1: ユーザーは新しい投稿を作成できる。
    *   FR2-2: ユーザーは自分が作成した投稿を削除できる。
*   **FR3: 投稿の閲覧**
    *   FR3-1: すべてのユーザー（ゲストおよびユーザー）は、投稿の一覧を閲覧できる。
    *   FR3-2: すべてのユーザー（ゲストおよびユーザー）は、個別の投稿内容を閲覧できる。

## 4. 非機能要求 (NFR)
*   **NFR1:** `GEMINI.md`に記載された技術テーマと方針に準拠する。
*   **NFR2:** Google Cloudをデプロイ先として想定する。
*   **NFR3:** ReactおよびFirebaseは使用しない。

## 5. ユースケース図

```plantuml
@startuml
left to right direction
actor ゲスト
actor ユーザー

rectangle "ブログアプリケーション" {
  usecase "投稿を閲覧する" as UC_VIEW
  usecase "アカウントを管理する" as UC_AUTH
  usecase "投稿を管理する" as UC_MANAGE

  ゲスト -- UC_VIEW
  ユーザー -- UC_VIEW
  ユーザー -- UC_AUTH
  ユーザー -- UC_MANAGE
}
@enduml
```

## 6. シーケンス図

### 6.1. 投稿を閲覧する (UC_VIEW)
ゲスト、ユーザー共通のユースケースです。

```plantuml
@startuml
title 投稿閲覧のシーケンス

actor アクター
participant "システム" as System

アクター -> System: 投稿一覧の表示を要求
System --> アクター: 投稿一覧を表示

alt 個別投稿の閲覧
    アクター -> System: 特定の投稿の表示を要求
    System --> アクター: 投稿の詳細を表示
end
@enduml
```

### 6.2. アカウントを管理する (UC_AUTH)
Google OAuthを利用した認証とログアウトのフローです。

```plantuml
@startuml
title アカウント管理のシーケンス (Google OAuth)

actor アクター
participant "システム" as System
participant "Google" as Google

alt ログイン/新規登録
    アクター -> System: Googleアカウントでのログインを要求
    System -> アクター: Googleの認証ページへリダイレクト
    アクター -> Google: Googleアカウントでログイン
    Google -> System: ユーザー情報を通知
    System -> アクター: ログイン成功を表示 (トップページへリダイレクト)
end

alt ログアウト
    ユーザー -> System: ログアウトを要求
    System --> ユーザー: ログアウト完了を表示 (トップページへリダイレクト)
end
@enduml
```

### 6.3. 投稿を管理する (UC_MANAGE)
認証済みユーザーの投稿作成、削除のフローです。

```plantuml
@startuml
title 投稿管理のシーケンス

actor ユーザー
participant "システム" as System

alt 投稿作成
    ユーザー -> System: 新規投稿作成を要求 (内容入力)
    System --> ユーザー: 作成完了を表示
end

alt 投稿削除
    ユーザー -> System: 自身の投稿の削除を要求
    System --> ユーザー: 削除完了を表示
end
@enduml
```
