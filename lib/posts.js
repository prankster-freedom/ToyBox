import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { enter, exit } from './logger.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

/**
 * Gets a single post by its ID.
 * @param {string} postId - The ID of the post to retrieve.
 * @returns {Promise<object|null>} The post object or null if not found.
 */
async function getPostById(postId) {
  const functionName = 'getPostById';
  enter(functionName, { postId });

  const posts = await getPosts();
  const post = posts.find(p => p.id === postId);

  if (!post) {
    exit(functionName, { result: null, reason: 'Post not found' });
    return null;
  }

  exit(functionName, post);
  return post;
}

export {
  getPosts,
  addPost,
  deletePost,
  getPostById,
};
