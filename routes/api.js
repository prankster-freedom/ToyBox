const express = require('express');
const greet = require('../lib/greet.js');

// 新しいルーターインスタンスを作成
const router = express.Router();

// ヘルスチェック用のエンドポイント
router.get('/health', (req, res) => {
  // サーバーが正常であることを示すステータスと、確認時刻を返す
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// APIエンドポイント ('/greet') へのPOSTリクエストを処理
// このルーターは '/api' の下にマウントされるため、パスは '/greet' となります
router.post('/greet', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const message = greet(name);
  res.json({ message: message });
});

module.exports = router;