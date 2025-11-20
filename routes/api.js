import express from 'express';
import postsRouter from './posts.js';
import healthRouter from './health.js';
import greetRouter from './greet.js';
import chatRouter from './chat.js';

// 新しいルーターインスタンスを作成
const router = express.Router();

// Mount the routers
router.use('/posts', postsRouter);
router.use('/health', healthRouter);
router.use('/greet', greetRouter);
router.use('/chat', chatRouter);

export default router;