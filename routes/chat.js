import express from 'express';
import { generateChatReply } from '../lib/ai.js';
import { enter, exit, log } from '../lib/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const functionName = 'POST /chat';
  enter(functionName, req.body);
  try {
    const { message } = req.body;
    if (!message) {
      log('ERROR:', functionName, 'Message is required');
      return res.status(400).json({ error: 'Message is required' });
    }
    const reply = await generateChatReply(message).catch((e) =>
      console.error('got error', e),
    );
    res.json({ reply });
    exit(functionName, { reply });
  } catch (e) {
    log('ERROR:', functionName, e);
    res.status(500).json({ error: 'Failed to generate chat reply.' });
  }
});

export default router;
