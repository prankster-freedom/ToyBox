import express from 'express';
import { generateChatReply } from '../lib/ai.js';
import { enter, exit, log } from '../lib/logger.js';
import { isAuthenticated } from '../middleware/auth.js';
import { 
    getRecentChatHistory, 
    saveChatMessage, 
    getAiPersona, 
    incrementInteractionCount 
} from '../lib/store.js';
import { CloudTasksClient } from '@google-cloud/tasks';

const router = express.Router();
const tasksClient = new CloudTasksClient();

router.post('/', isAuthenticated, async (req, res) => {
  const functionName = 'POST /chat';
  enter(functionName, req.body);
  
  const user = req.user;
  const { message, isAutoTrigger } = req.body;

  if (!message && !isAutoTrigger) {
      return res.status(400).json({ error: 'Message is required unless auto trigger' });
  }

  try {
    // 1. ユーザーのメッセージを保存 (AutoTriggerの場合は保存しない、またはSystemとして保存も考えられるが、ここではUser発言なしとする)
    if (message) {
        await saveChatMessage(user.id, 'user', message);
    }

    // 2. コンテキスト（履歴とペルソナ）を取得
    const history = await getRecentChatHistory(user.id, 20);
    const personaData = await getAiPersona(user.id);
    const persona = personaData.basePersonality;

    // 3. AI応答生成
    const reply = await generateChatReply(message, history, persona, isAutoTrigger);

    // 4. AIの応答を保存
    await saveChatMessage(user.id, 'model', reply);

    // 5. インタラクションカウントの更新とDaydreamトリガー
    const count = await incrementInteractionCount(user.id);
    
    if (count > 0 && count % 10 === 0) {
        await enqueueDaydreamTask(user.id);
    }

    res.json({ message: reply });
    exit(functionName, { reply, interactionCount: count });
  } catch (e) {
    log('ERROR:', functionName, e);
    res.status(500).json({ error: 'Failed to generate chat reply.' });
  }
});

async function enqueueDaydreamTask(userId) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const queue = process.env.TASK_QUEUE_NAME || 'daydream-queue';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'asia-northeast1';
    const url = process.env.BASE_URL ? `${process.env.BASE_URL}/api/tasks/daydream` : 'http://localhost:8080/api/tasks/daydream';

    if (!project) {
        log('WARNING', 'enqueueDaydreamTask', 'GOOGLE_CLOUD_PROJECT not set, skipping task enqueue.');
        return;
    }

    const parent = tasksClient.queuePath(project, location, queue);
    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            body: Buffer.from(JSON.stringify({ userId })).toString('base64'),
            // OIDC token settings if needed
            // oidcToken: { serviceAccountEmail: ... }
        },
    };

    try {
        const [response] = await tasksClient.createTask({ parent, task });
        log('INFO', 'enqueueDaydreamTask', `Created task ${response.name}`);
    } catch (err) {
        log('ERROR', 'enqueueDaydreamTask', err);
    }
}

export default router;
