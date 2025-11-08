import express from 'express';
import greet from '../lib/greet.js';
import { enter, exit } from '../lib/logger.js';
import { isAuthenticated } from '../middleware/auth.js';
import postsRouter from './posts.js';

// 新しいルーターインスタンスを作成
const router = express.Router();

// Mount the posts router
router.use('/posts', postsRouter);

// ヘルスチェック用のエンドポイント (Public)
router.get('/health', (req, res) => {
  const functionName = 'GET /api/health';
  enter(functionName);

  const response = { status: 'ok', timestamp: new Date().toISOString() };
  // サーバーが正常であることを示すステータスと、確認時刻を返す
  res.status(200).json(response);

  exit(functionName, response);
});

// APIエンドポイント ('/greet') へのPOSTリクエストを処理 (Authenticated)
router.post('/greet', isAuthenticated, (req, res) => {
  const functionName = 'POST /api/greet';
  enter(functionName, { body: req.body });

  const { name } = req.body;
  if (!name) {
    const errorResponse = { error: 'name is required' };
    exit(functionName, errorResponse);
    return res.status(400).json(errorResponse);
  }
  const message = greet(name);
  const response = { message: message };
  res.json(response);

  exit(functionName, response);
});

export default router;