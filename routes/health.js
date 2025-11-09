import express from 'express';
import { enter, exit } from '../lib/logger.js';

const router = express.Router();

// ヘルスチェック用のエンドポイント (Public)
router.get('/', (req, res) => {
  const functionName = 'GET /api/health';
  enter(functionName);

  const response = { status: 'ok', timestamp: new Date().toISOString() };
  // サーバーが正常であることを示すステータスと、確認時刻を返す
  res.status(200).json(response);

  exit(functionName, response);
});

export default router;
