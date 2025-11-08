const express = require('express');
const greet = require('../lib/greet.js');
const { enter, exit } = require('../lib/logger');

// 新しいルーターインスタンスを作成
const router = express.Router();

// ヘルスチェック用のエンドポイント
router.get('/health', (req, res) => {
  const functionName = 'GET /api/health';
  enter(functionName);

  const response = { status: 'ok', timestamp: new Date().toISOString() };
  // サーバーが正常であることを示すステータスと、確認時刻を返す
  res.status(200).json(response);

  exit(functionName, response);
});

// APIエンドポイント ('/greet') へのPOSTリクエストを処理
// このルーターは '/api' の下にマウントされるため、パスは '/greet' となります
router.post('/greet', (req, res) => {
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

module.exports = router;