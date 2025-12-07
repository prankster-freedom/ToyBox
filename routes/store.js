import express from "express";
import * as store from "../lib/store.js";
import { log } from "../lib/logger.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// ユーザー情報を保存（認証ユーザー自身の情報を保存）
router.post("/users", isAuthenticated, async (req, res) => {
  try {
    // デモ用：リクエストボディにユーザー情報があればそれを使う（管理者用）
    // なければ、認証済みユーザーの情報を保存
    const userToSave = req.body.user || req.user;
    if (!userToSave || !userToSave.id) {
      return res.status(400).json({ error: "User ID is required." });
    }
    await store.saveUser(userToSave);
    res.status(200).json({ message: `User ${userToSave.id} saved.` });
  } catch (err) {
    log("ERROR", "POST /users", err);
    res.status(500).json({ error: "Error saving user." });
  }
});

// AIペルソナを取得
router.get("/ai-personas/:userId", isAuthenticated, async (req, res) => {
  try {
    const persona = await store.getAiPersona(req.params.userId);
    res.status(200).json(persona);
  } catch (err) {
    log("ERROR", `GET /ai-personas/${req.params.userId}`, err);
    res.status(500).json({ error: "Error getting AI persona." });
  }
});

// AIペルソナを更新
router.post("/ai-personas/:userId", isAuthenticated, async (req, res) => {
  try {
    await store.updateAiPersona(req.params.userId, req.body);
    res.status(200).json({ message: `AI persona for ${req.params.userId} updated.` });
  } catch (err) {
    log("ERROR", `POST /ai-personas/${req.params.userId}`, err);
    res.status(500).json({ error: "Error updating AI persona." });
  }
});

// チャットメッセージを保存
router.post("/chat-messages/:userId", isAuthenticated, async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ error: "Role and content are required." });
    }
    await store.saveChatMessage(req.params.userId, role, content);
    res.status(201).json({ message: "Chat message saved." });
  } catch (err) {
    log("ERROR", `POST /chat-messages/${req.params.userId}`, err);
    res.status(500).json({ error: "Error saving chat message." });
  }
});

// 最近の分析結果を取得
router.get("/analyses/:userId", isAuthenticated, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    const analyses = await store.getRecentAnalyses(req.params.userId, limit);
    res.status(200).json(analyses);
  } catch (err) {
    log("ERROR", `GET /analyses/${req.params.userId}`, err);
    res.status(500).json({ error: "Error getting analyses." });
  }
});

// 最近のチャット履歴を取得
router.get("/chat-messages/:userId", isAuthenticated, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const history = await store.getRecentChatHistory(req.params.userId, limit);
    res.status(200).json(history);
  } catch (err) {
    log("ERROR", `GET /chat-messages/${req.params.userId}`, err);
    res.status(500).json({ error: "Error getting chat history." });
  }
});

// ユーザーデータを削除
router.delete("/users/:userId", isAuthenticated, async (req, res) => {
  try {
    // 本番環境での誤操作を防ぐための簡易的なガード
    if (
      process.env.NODE_ENV === "production" &&
      req.user.id !== req.params.userId
    ) {
      return res
        .status(403)
        .json({ error: "You can only delete your own data in production." });
    }
    await store.deleteUserData(req.params.userId);
    res.status(200).json({ message: `All data for user ${req.params.userId} deleted.` });
  } catch (err) {
    log("ERROR", `DELETE /users/${req.params.userId}`, err);
    res.status(500).json({ error: "Error deleting user data." });
  }
});

export default router;
