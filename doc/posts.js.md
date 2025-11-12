# `posts.js` - Line-by-Line Explanation

This file defines the API routes for CRUD (Create, Read, Update, Delete) operations on posts.

- **Line 1-4:** `import ...`
  - Imports `express` for routing, the data-layer functions (`getPosts`, `addPost`, etc.) from `lib/posts.js`, logging functions, and the `isAuthenticated` middleware.
- **Line 6:** `const router = express.Router();`
  - Creates a new Express router for post-related endpoints.

- **Line 9:** `router.get('/', async (req, res) => { ... });`
  - **Route:** `GET /api/posts`
  - **Purpose:** To get a list of all posts. This is a public endpoint.
  - **Logic:** It calls `await getPosts()`, sends the resulting array of posts with a `200 OK` status. It includes `try...catch` for error handling, returning a `500 Internal Server Error` if something goes wrong.

- **Line 24:** `router.get('/:id', async (req, res) => { ... });`
  - **Route:** `GET /api/posts/:id` (e.g., `/api/posts/some-uuid-123`)
  - **Purpose:** To get a single post by its unique ID. This is a public endpoint.
  - **Logic:**
    - It extracts the `id` from the request parameters (`req.params`).
    - It calls `await getPostById(id)`.
    - If a `post` is found, it returns the post object with a `200 OK` status.
    - If the post is `null` (not found), it returns a `404 Not Found` status with an error message.
    - Includes `try...catch` for server errors.

- **Line 45:** `router.post('/', isAuthenticated, async (req, res) => { ... });`
  - **Route:** `POST /api/posts`
  - **Purpose:** To create a new post. This is a protected endpoint, requiring authentication.
  - **Middleware:** `isAuthenticated` runs first to ensure the user is logged in.
  - **Logic:**
    - It validates that `req.body.content` exists, returning a `400 Bad Request` if it's missing.
    - It calls `await addPost(content, req.user)`. The authenticated `user` object (from the session) is passed to the business logic layer.
    - On success, it returns the `newPost` object with a `201 Created` status.
    - Includes `try...catch` for server errors.

- **Line 66:** `router.delete('/:id', isAuthenticated, async (req, res) => { ... });`
  - **Route:** `DELETE /api/posts/:id`
  - **Purpose:** To delete a post. This is a protected endpoint.
  - **Middleware:** `isAuthenticated` ensures the user is logged in.
  - **Logic:**
    - It extracts the `id` from `req.params`.
    - It calls `await deletePost(id, req.user)`. The `deletePost` function in `lib/posts.js` contains the logic to verify that the user attempting the deletion is the actual author of the post.
    - If `deletePost` returns `true` (successful deletion), it sends a `204 No Content` response, which is standard for successful DELETE requests.
    - If `deletePost` returns `false` (post not found or user not authorized), it returns a `404 Not Found` status. This is a good security practice as it doesn't reveal whether the post existed but the user was just unauthorized.
    - Includes `try...catch` for server errors.

- **Line 87:** `export default router;`
  - Exports the configured router to be used in `routes/api.js`.