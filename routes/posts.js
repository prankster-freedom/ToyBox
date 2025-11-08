'use strict';

const express = require('express');
const { getPosts, addPost, deletePost } = require('../lib/posts');
const { enter, exit } = require('../lib/logger');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - Get all posts (Public)
router.get('/', async (req, res) => {
  const functionName = 'GET /api/posts';
  enter(functionName);

  try {
    const posts = await getPosts();
    // For the public endpoint, we don't wrap in a data object, just return the array.
    res.status(200).send(posts);
    exit(functionName, { count: posts.length });
  } catch (error) {
    exit(functionName, { error });
    res.status(500).json({ message: 'Error retrieving posts' });
  }
});

// POST /api/posts - Create a new post (Authenticated)
router.post('/', isAuthenticated, async (req, res) => {
  const functionName = 'POST /api/posts';
  enter(functionName, { body: req.body });

  const { content } = req.body;
  if (!content) {
    const response = { message: 'Content is required' };
    exit(functionName, response);
    return res.status(400).json(response);
  }

  try {
    const newPost = await addPost(content, req.user);
    res.status(201).json(newPost);
    exit(functionName, newPost);
  } catch (error) {
    exit(functionName, { error });
    res.status(500).json({ message: 'Error creating post' });
  }
});

// DELETE /api/posts/:id - Delete a post (Authenticated)
router.delete('/:id', isAuthenticated, async (req, res) => {
  const functionName = 'DELETE /api/posts/:id';
  const { id } = req.params;
  enter(functionName, { postId: id });

  try {
    const deleted = await deletePost(id, req.user);
    if (deleted) {
      res.status(204).send(); // No Content
      exit(functionName, { result: 'success' });
    } else {
      // Could be not found or not authorized.
      // For security, we'll return 404 in both cases to avoid leaking information.
      const response = { message: 'Post not found or user not authorized' };
      exit(functionName, response);
      res.status(404).json(response);
    }
  } catch (error) {
    exit(functionName, { error });
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;
