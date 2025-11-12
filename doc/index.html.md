# `index.html` - Line-by-Line Explanation

This HTML file serves as the main user interface for the application, providing a simple single-page application experience.

- **Line 1-6:** `<!DOCTYPE html> ... <head> ... </head>`
  - Standard HTML5 boilerplate. Sets the language to Japanese (`ja`), character encoding, viewport for responsiveness, and the page title to "API Tester".
- **Line 7-12:** `<style> ... </style>`
  - Contains minimal inline CSS for basic layout and styling of the page elements.
- **Line 14:** `<body>`
  - Begins the visible content of the page.
- **Line 15:** `<h1>API Tester</h1>`
  - The main heading for the page.
- **Line 16-19:** `<div id="auth-section"> ... </div>`
  - This `div` is shown to unauthenticated users.
  - It contains a message "You are not logged in."
  - A "Login with Google" button which, when clicked, redirects the user to the `/auth/google` URL to initiate the OAuth flow.
- **Line 20-31:** `<div id="app-section" style="display: none;"> ... </div>`
  - This `div` contains the main application content and is hidden by default (`display: none;`). It will be shown by the JavaScript code once the user is authenticated.
  - **Line 21:** A welcome message that will display the user's name (`<span id="userName">`) and a "Logout" button that redirects to `/auth/logout`.
  - **Line 22-26:** A section for the "Greet API". It has an input field for a name (`nameInput`) and a button (`greetButton`) to trigger the API call.
  - **Line 27-30:** A section for the "Health Check API" with a button (`healthCheckButton`) to trigger the call.
  - **Line 31:** A paragraph element (`<p id="result">`) where the results of the API calls will be displayed.
- **Line 33:** `<hr>`
  - A horizontal rule to separate the main content from the footer link.
- **Line 34:** `<p><a href="/developer.html">Developer API Console</a></p>`
  - A link to the `developer.html` page, providing access to the developer-focused API console.
- **Line 35:** `<script src="script.js"></script>`
  - Includes the external JavaScript file `script.js`, which contains all the logic for handling user interactions, authentication checks, and API calls for this page.
