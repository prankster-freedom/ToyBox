# `script.js` - Line-by-Line Explanation

This script creates a Vue.js application to manage the client-side logic for `index.html`.

- **Line 1:** `const { createApp } = Vue;`
  - Destructures the `createApp` function from the global `Vue` object provided by the Vue.js library.
- **Line 3:** `createApp({ ... }).mount('#app');`
  - Creates a new Vue application instance with the provided options object and mounts it to the HTML element with the ID `#app`.
- **Line 4:** `data() { ... }`
  - A function that returns the initial data state for the application.
  - `user`: Stores the authenticated user object. Initially `null`.
  - `greetName`, `chatMessage`: Bound to the input fields for the Greet and Chat APIs.
  - `result`: Stores the string representation of the last API call's result.
- **Line 12:** `async created() { ... }`
  - A Vue lifecycle hook that runs after the application instance is created. It's used to check the user's authentication status when the page loads.
  - It fetches the `/user` endpoint. If successful, it populates `this.user`. If not, it redirects to the login page.
- **Line 25:** `methods: { ... }`
  - An object containing methods that can be called from the template (e.g., via `@click`).
- **Line 26:** `async greet() { ... }`
  - Method to call the Greet API. It uses the `greetName` from the data, calls the `/api/greet` endpoint, and updates `this.result` with the response.
- **Line 37:** `async healthCheck() { ... }`
  - Method to call the Health Check API. It calls `/api/health` and updates `this.result`.
- **Line 46:** `async chat() { ... }`
  - Method to call the new AI Chat API. It uses `chatMessage` from the data, calls `/api/chat`, and updates `this.result`.
- **Line 57:** `async fetchApi(path, options) { ... }`
  - A helper method to centralize the logic for making `fetch` requests.
  - It sets `this.result` to '通信中...' to provide user feedback.
  - It performs the fetch call, handles both successful and error responses, and updates `this.result` with a formatted JSON string or an error message.
