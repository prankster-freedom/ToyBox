# 詳細設計: 記憶管理 API (`routes/memory.js`)

## 概要

ユーザーの記憶（データ）を管理する API エンドポイント。主に全データ削除機能を提供する。

## エンドポイント

### `DELETE /api/memory`

- **認証**: 必須 (`isAuthenticated`)
- **リクエストボディ**: なし
- **レスポンス**: `204 No Content`

## 処理フロー

1. **認証チェック**: ミドルウェアでログイン済みか確認。
2. **データ削除**:
   - `store.deleteUserData(req.user.id)` を呼び出す。
   - この関数内で、User, AiPersona, ChatMessage, PersonalityAnalysis の全データが削除される。
3. **ログアウト処理**:
   - セッションを破棄する (`req.logout()`, `req.session.destroy()`)。
4. **レスポンス返却**: ステータスコード 204 を返す。
