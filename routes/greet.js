import express from 'express';
import greet from '../lib/greet.js';
import { enter, exit } from '../lib/logger.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// APIエンドポイント ('/greet') へのPOSTリクエストを処理 (Authenticated)
router.post('/', isAuthenticated, (req, res) => {
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
