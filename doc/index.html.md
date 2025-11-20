# `index.html` - Line-by-Line Explanation

This HTML file serves as the main user interface for the application, providing a simple single-page application experience.

- **Line 1-6:** `<!DOCTYPE html> ... <head> ... </head>`
  - Standard HTML5 boilerplate. Sets the language to Japanese (`ja`), character encoding, viewport for responsiveness, and the page title to "API Tester". It also includes the Vue.js library from a CDN.
- **Line 7-12:** `<style> ... </style>`
  - Contains minimal inline CSS for basic layout and styling of the page elements.
- **Line 14:** `<body>`
  - Begins the visible content of the page.
- **Line 15:** `<div id="app"> ... </div>`
  - This is the main container element where the Vue application will be mounted.
- **Line 16:** `<h1>API Tester</h1>`
  - The main heading for the page.
- **Line 18-23:** `<div v-if="!user"> ... </div>`
  - This `div` is conditionally rendered by Vue (`v-if`) if the `user` data property is `null` (i.e., the user is not logged in). It shows a login message and a "Login with Google" button.
- **Line 24-49:** `<div v-else> ... </div>`
  - This `div` is rendered if the `user` data property exists. It contains the main application content for authenticated users.
  - **Line 25:** A welcome message that displays the user's name (`{{ user.displayName }}`) and a "Logout" button.
  - **Line 28-32:** A section for the "Greet API". It uses `v-model` to bind the input field to the `greetName` data property and `@click` to call the `greet` method.
  - **Line 34-37:** A section for the "Health Check API", which calls the `healthCheck` method on button click.
  - **Line 39-44:** A section for the new "AI Chat API". It binds a textarea to the `chatMessage` data property and calls the `chat` method on button click.
  - **Line 46:** A `<pre>` tag to display the `result` of the API calls.
- **Line 51:** `<hr>`
  - A horizontal rule separating the main content from the footer.
- **Line 52:** `<p><a href="/developer.html">Developer API Console</a></p>`
  - A link to the developer console.
- **Line 53:** `<script src="script.js"></script>`
  - Includes the external JavaScript file, which now contains the Vue application logic.
