import express from 'express';
import { enter, exit, log } from '../lib/logger.js';
import { getRecentChatHistory, savePersonalityAnalysis } from '../lib/store.js';
import { analyzePersonality } from '../lib/ai.js';

const router = express.Router();

// Cloud Tasksからのリクエストを処理するエンドポイント
// 本番環境ではOIDCトークンの検証などを推奨しますが、ここでは簡易的に実装します。
router.post('/daydream', async (req, res) => {
  const functionName = 'POST /api/tasks/daydream';
  enter(functionName, { body: req.body });

  const { userId } = req.body;
  if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
  }

  try {
      // 直近の会話履歴を取得 (例: 過去10件)
      const history = await getRecentChatHistory(userId, 10);
      if (history.length === 0) {
          log(functionName, 'No history found for analysis.');
          res.status(200).json({ message: 'No history to analyze' });
          exit(functionName);
          return;
      }

      // AIによる分析
      const analysisResult = await analyzePersonality(history);
      
      // 分析結果を保存
      await savePersonalityAnalysis(userId, analysisResult, 'daydream');
      
      log(functionName, 'Daydream analysis completed and saved.');
      res.status(200).json({ message: 'Daydream completed' });
  } catch (error) {
      log('ERROR', functionName, error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
  
  exit(functionName);
});

export default router;
