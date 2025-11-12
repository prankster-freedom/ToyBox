# `developer.html` - Line-by-Line Explanation

This HTML file provides a simple web interface for developers to manually test the application's API endpoints.

- **Line 1-5:** `<!DOCTYPE html> ... <head> ... </head>`
  - Standard HTML5 boilerplate, setting the language to Japanese (`ja`), character encoding to UTF-8, and defining the viewport for responsive design. The title is "Developer API Console".
- **Line 6-16:** `<style> ... </style>`
  - Contains CSS rules for basic styling of the page, making the API endpoint sections visually distinct and readable. It styles elements like the body, endpoint containers, HTTP method labels (GET, POST, DELETE), and the response area.
- **Line 18:** `<body>`
  - Begins the visible content of the page.
- **Line 19:** `<p><a href="/index.html">Home</a></p>`
  - A navigation link back to the main `index.html` page.
- **Line 20:** `<h1>Developer API Console</h1>`
  - The main heading of the page.
- **Line 24-29:** `<!-- GET /api/health -->`
  - A section for testing the health check endpoint. It includes a description, an "Execute" button that calls the `fetchApi` JavaScript function, and a `<pre>` tag to display the formatted API response.
- **Line 31-36:** `<!-- GET /api/posts -->`
  - A section for testing the endpoint to get all posts.
- **Line 38-45:** `<!-- GET /api/posts/:id -->`
  - A section for testing the endpoint to get a single post. It includes an `input` field (`param-posts-get-one-id`) for the user to enter the post ID. The `onclick` attribute dynamically constructs the URL for the API call.
- **Line 47-54:** `<!-- POST /api/posts -->`
  - A section for testing the endpoint to create a new post. It includes a `<textarea>` for the JSON request body and passes its content to the `fetchApi` function.
- **Line 56-63:** `<!-- DELETE /api/posts/:id -->`
  - A section for testing the endpoint to delete a post, including an `input` for the post ID.
- **Line 65-70:** `<!-- GET /user -->`
  - A section for testing the endpoint to get the current user's information.
- **Line 72-79:** `<!-- POST /api/greet -->`
  - A section for testing the greet endpoint, including a `<textarea>` for the JSON request body.
- **Line 82-102:** `<script> ... </script>`
  - Contains the JavaScript logic for the page.
- **Line 83:** `async function fetchApi(id, method, path, body = null) {`
  - Defines an asynchronous function `fetchApi` that handles the API calls. It takes an `id` (to identify the response element), the HTTP `method`, the API `path`, and an optional request `body`.
- **Line 84:** `const responseElement = document.getElementById("response-${id}");`
  - Gets the `<pre>` element where the response should be displayed.
- **Line 85:** `responseElement.textContent = 'Fetching...';`
  - Provides immediate feedback to the user that the request has started.
- **Line 87-93:** `const options = { ... };`
  - Constructs the `options` object for the `fetch` call. It sets the method and, if a `body` is provided, sets the `Content-Type` header to `application/json` and includes the body.
- **Line 95-101:** `try { ... } catch (error) { ... }`
  - A `try...catch` block to handle the `fetch` request.
  - `await fetch(path, options)`: Makes the actual API call.
  - `await response.json()`: Parses the response body as JSON.
  - `JSON.stringify(responseData, null, 2)`: Formats the JSON data with indentation for readability.
  - The final formatted string (including the status code) is placed in the `responseElement`.
  - If an error occurs (e.g., network failure), the `catch` block displays the error message.

