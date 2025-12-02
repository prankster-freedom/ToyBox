import express from 'express';
import postsRouter from './posts.js';
import healthRouter from './health.js';
import greetRouter from './greet.js';
import chatRouter from './chat.js';
import tasksRouter from './tasks.js';
import memoryRouter from './memory.js';
import storeRouter from './store.js';

// 新しいルーターインスタンスを作成
const router = express.Router();

// Mount the routers
router.use('/posts', postsRouter);
router.use('/health', healthRouter);
router.use('/greet', greetRouter);
router.use('/chat', chatRouter);
router.use('/tasks', tasksRouter);
router.use('/memory', memoryRouter);
router.use('/store', storeRouter);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

export default router;
