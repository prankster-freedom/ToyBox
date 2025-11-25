import express from 'express';
import postsRouter from './posts.js';
import healthRouter from './health.js';
import greetRouter from './greet.js';
import chatRouter from './chat.js';
import tasksRouter from './tasks.js';
import memoryRouter from './memory.js';

// 新しいルーターインスタンスを作成
const router = express.Router();

// Mount the routers
router.use('/posts', postsRouter);
router.use('/health', healthRouter);
router.use('/greet', greetRouter);
router.use('/chat', chatRouter);
router.use('/tasks', tasksRouter);
router.use('/memory', memoryRouter);

export default router;
