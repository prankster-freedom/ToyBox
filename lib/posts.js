'use strict';

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { enter, exit } = require('./logger');

const postsFilePath = path.join(__dirname, '..', 'data', 'posts.json');

/**
 * Reads all posts from the JSON file.
 * @returns {Promise<Array>} A promise that resolves to an array of posts.
 */
async function getPosts() {
  const functionName = 'getPosts';
  enter(functionName);

  try {
    const data = await fs.readFile(postsFilePath, 'utf8');
    const posts = JSON.parse(data);
    exit(functionName, { count: posts.length });
    return posts;
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      exit(functionName, { count: 0, status: 'File not found or empty, returning []' });
      return [];
    }
    exit(functionName, { error });
    throw error;
  }
}

/**
 * Writes an array of posts to the JSON file.
 * @param {Array} posts - The array of posts to write.
 * @returns {Promise<void>}
 */
async function savePosts(posts) {
  const functionName = 'savePosts';
  enter(functionName, { postCount: posts.length });
  await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
  exit(functionName);
}

/**
 * Adds a new post.
 * @param {string} content - The content of the post.
 * @param {object} user - The user creating the post.
 * @returns {Promise<object>} The newly created post.
 */
async function addPost(content, user) {
  const functionName = 'addPost';
  enter(functionName, { content, user: user.displayName });

  const posts = await getPosts();
  const newPost = {
    id: uuidv4(),
    content,
    author: {
      id: user.id,
      displayName: user.displayName,
      photo: user.photos && user.photos.length > 0 ? user.photos[0].value : null,
    },
    createdAt: new Date().toISOString(),
  };
  posts.unshift(newPost); // Add to the beginning of the array
  await savePosts(posts);

  exit(functionName, newPost);
  return newPost;
}

/**
 * Deletes a post by its ID.
 * @param {string} postId - The ID of the post to delete.
 * @param {object} user - The user attempting to delete the post.
 * @returns {Promise<boolean>} True if deleted, false otherwise.
 */
async function deletePost(postId, user) {
  const functionName = 'deletePost';
  enter(functionName, { postId, user: user.displayName });

  const posts = await getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);

  if (postIndex === -1) {
    exit(functionName, { result: false, reason: 'Post not found' });
    return false; // Post not found
  }

  if (posts[postIndex].author.id !== user.id) {
    exit(functionName, { result: false, reason: 'User not authorized' });
    return false; // User is not the author
  }

  posts.splice(postIndex, 1);
  await savePosts(posts);

  exit(functionName, { result: true });
  return true;
}

module.exports = {
  getPosts,
  addPost,
  deletePost,
};
