# `script.js` - Line-by-Line Explanation

This script provides the client-side logic for the `index.html` page, handling user authentication status, UI updates, and API interactions.

- **Line 1-8:** `const ... = document.getElementById(...)`
  - These lines get references to all the necessary HTML elements from the DOM (input fields, buttons, display areas) and store them in constants for easy access.

- **Line 12:** `window.onload = async () => { ... };`
  - This sets up an asynchronous function to run as soon as the page has finished loading. This function is responsible for checking the user's authentication status.

- **Line 13-14:** `try { const response = await fetch('/user'); ... }`
  - It attempts to fetch data from a `/user` endpoint. This endpoint is expected to return information about the currently logged-in user.

- **Line 15:** `if (response.ok) { ... }`
  - If the fetch request is successful (HTTP status 200-299), it proceeds to process the user data.

- **Line 16:** `const user = await response.json();`
  - Parses the JSON response from the `/user` endpoint into a `user` object.

- **Line 17-22:** `if (user && user.displayName) { ... } else { ... }`
  - Checks if a `user` object with a `displayName` was successfully retrieved.
  - If yes, it updates the `userNameSpan` with the user's name and switches the UI visibility: it hides the login section (`authSection`) and shows the main application content (`appSection`).
  - If no, it assumes the user is not properly logged in and redirects them to the Google login page.

- **Line 23-29:** `} else { ... } catch (error) { ... }`
  - If the initial `/user` fetch fails or if any other error occurs during the process, the user is redirected to the Google login page. This ensures that only authenticated users can see the main application content.

- **Line 32:** `greetButton.addEventListener('click', async () => { ... });`
  - Adds a click event listener to the "Greet" button. When clicked, it executes the provided asynchronous function.

- **Line 33:** `const name = nameInput.value || 'World';`
  - Gets the value from the name input field. If the field is empty, it defaults to the string 'World'.

- **Line 34:** `resultParagraph.textContent = '通信中...';`
  - Updates the result paragraph to show a "loading" message to the user.

- **Line 36-43:** `const response = await fetch('/api/greet', { ... });`
  - Makes a `POST` request to the `/api/greet` endpoint using the `fetch` API.
  - It includes the necessary `Content-Type` header and a JSON body containing the `name` to be greeted.

- **Line 45-47:** `if (!response.ok) { ... }`
  - Checks if the server's response was successful. If not, it throws an error to be caught by the `catch` block.

- **Line 49:** `const data = await response.json();`
  - Parses the successful JSON response from the server.

- **Line 50:** `resultParagraph.textContent = data.message;`
  - Displays the `message` from the server's response in the result paragraph.

- **Line 51-54:** `catch (error) { ... }`
  - If any error occurred during the `fetch` process, it logs the error to the console and displays a generic error message to the user.

- **Line 57:** `healthCheckButton.addEventListener('click', async () => { ... });`
  - Adds a click event listener to the "Run Health Check" button.

- **Line 58-74:** (Function Body)
  - This function is very similar to the `greetButton` handler. It sets a loading message, makes a `GET` request to the `/api/health` endpoint, checks for a successful response, and then displays the formatted status and timestamp from the response data. It also includes error handling.
