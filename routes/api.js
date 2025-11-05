
const express = require('express');
const router = express.Router();

// Import routers
const postsRouter = require('./posts');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routers
router.use('/posts', postsRouter);

module.exports = router;