
const express = require('express');
const router = express.Router();

const fs = require('fs');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const postsDB = './data/posts.json';

// Helper function to read posts from DB
const readPosts = () => {
  const data = fs.readFileSync(postsDB);
  // If the file is empty, return an empty array to avoid JSON parsing errors
  if (data.length === 0) {
    return [];
  }
  return JSON.parse(data);
};

// Helper function to write posts to DB
const writePosts = (posts) => {
  fs.writeFileSync(postsDB, JSON.stringify(posts, null, 2));
};

// GET /api/posts
router.get('/', (req, res, next) => {
  try {
    const posts = readPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id
router.get('/:id', (req, res, next) => {
  try {
    const posts = readPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// POST /api/posts
router.post('/', auth, (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const posts = readPosts();

    const newPost = {
      id: uuidv4(),
      title,
      content,
      authorId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);
    writePosts(posts);

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, (req, res, next) => {
  try {
    const posts = readPosts();
    const postIndex = posts.findIndex(p => p.id === req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[postIndex];

    if (post.authorId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    posts.splice(postIndex, 1);
    writePosts(posts);

    res.json({ message: 'Post removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
