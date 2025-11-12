# `requestLogger.js` - Line-by-Line Explanation

This module provides Express middleware to set up a request-specific logging context using `AsyncLocalStorage`.

- **Line 1:** `import { asyncLocalStorage } from '../lib/logger.js';`
  - Imports the `asyncLocalStorage` instance that was created and exported from `lib/logger.js`.

- **Line 3-5:** `/** ... */`
  - A JSDoc comment block describing the purpose of the `requestLogger` middleware.

- **Line 6:** `function requestLogger(req, res, next) {`
  - Defines the middleware function `requestLogger`.

- **Line 8:** `const logStore = [];`
  - Creates a new, empty array `logStore`. This array will serve as the dedicated storage for log messages for this specific HTTP request.

- **Line 9:** `asyncLocalStorage.run(logStore, () => {`
  - This is the core of the context management. The `.run()` method of `AsyncLocalStorage` takes two arguments:
    1.  The data to store for the context (here, the empty `logStore` array).
    2.  A callback function to execute within that context.

- **Line 10:** `next();`
  - Inside the callback, `next()` is called. This passes control to the next middleware in the Express chain. Crucially, any asynchronous operations that are initiated after this `next()` call (e.g., in other middleware or in the final route handler) will now be part of the context created by `.run()`.

- **Line 11:** `});`
  - Closes the `asyncLocalStorage.run()` call. When the request-response cycle is complete and the callback finishes, the context is automatically exited and cleaned up.

- **Line 14-16:** `export { ... };`
  - Exports the `requestLogger` middleware so it can be added to the main Express application setup, typically as one of the very first middleware functions.
