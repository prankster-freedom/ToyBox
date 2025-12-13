import express from "express";
import { enter, exit, log } from "../lib/logger.js";
import {
  getRecentChatHistory,
  savePersonalityAnalysis,
  getAllUserIdsActiveToday,
  getChatHistoryForDay,
  getRecentAnalyses,
  getAiPersona,
  updateAiPersona,
} from "../lib/store.js";
import { analyzePersonality, synthesizePersonality } from "../lib/ai.js";

const router = express.Router();

// Cloud Tasksからのリクエストを処理するエンドポイント
// 本番環境ではOIDCトークンの検証などを推奨しますが、ここでは簡易的に実装します。
router.post("/daydream", async (req, res) => {
  const functionName = "POST /api/tasks/daydream";
  enter(functionName, { body: req.body });

  const { userId, isTest } = req.body;
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  try {
    if (isTest) {
      log(functionName, "Running in TEST mode.");
      // テスト用固定データ
      const mockAnalysis = "あなたはソフトウェアテストの専門用語が好きです";
      await savePersonalityAnalysis(userId, mockAnalysis, "daydream");

      log(functionName, "Daydream analysis completed (Test Mode).");
      res.status(200).json({ message: "Daydream completed (Test Mode)" });
      exit(functionName);
      return;
    }

    // 直近の会話履歴を取得 (例: 過去10件)
    const history = await getRecentChatHistory(userId, 10);
    if (history.length === 0) {
      log(functionName, "No history found for analysis.");
      res.status(200).json({ message: "No history to analyze" });
      exit(functionName);
      return;
    }

    // AIによる分析
    const analysisResult = await analyzePersonality(history);

    // 分析結果を保存
    await savePersonalityAnalysis(userId, analysisResult, "daydream");

    log(functionName, "Daydream analysis completed and saved.");
    res.status(200).json({ message: "Daydream completed" });
  } catch (error) {
    log("ERROR", functionName, error);
    res.status(500).json({ error: "Internal Server Error" });
  }

  exit(functionName);
});

// Dreamタスク: ユーザーの長期記憶統合（性格更新）を行う
// Cloud Scheduler (毎日深夜) または 開発者ツールからトリガーされる
router.post('/dream', async (req, res) => {
    const functionName = 'POST /api/tasks/dream';
    enter(functionName, { body: req.body });

    const { userId } = req.body; // テスト用に特定のユーザーのみ指定可能
    let userIds = [];

    try {
        if (userId) {
            userIds = [userId];
            log(functionName, `Targeting specific user: ${userId}`);
        } else {
            // 指定がない場合は本日アクティブだった全ユーザーを対象（本来のDreamバッチ動作）
            userIds = await getAllUserIdsActiveToday();
            log(functionName, `Targeting all active users (${userIds.length})`);
        }

        const today = new Date();
        const results = [];

        for (const targetId of userIds) {
            log(functionName, `Processing user: ${targetId}`);

            // データ取得
            const history = await getChatHistoryForDay(targetId, today);
            if (history.length === 0) {
                log(functionName, `No chat history for user ${targetId}, skipping.`);
                results.push({ userId: targetId, status: 'skipped', reason: 'no_history' });
                continue;
            }

            const analyses = await getRecentAnalyses(targetId, 5);
            const currentPersonaData = await getAiPersona(targetId);

            // 性格の再統合
            const newPersonality = await synthesizePersonality(
                currentPersonaData.basePersonality,
                history,
                analyses
            );

            // 更新
            await updateAiPersona(targetId, { basePersonality: newPersonality });
            
            // ログ記録（本来は分析履歴として残すべきだが、今回はログのみ）
            log(functionName, `Updated personality for user ${targetId}`);
            results.push({ userId: targetId, status: 'updated' });
        }

        res.status(200).json({ message: 'Dream task completed', results });
    } catch (error) {
        log('ERROR', functionName, error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }

    exit(functionName);
});

export default router;
