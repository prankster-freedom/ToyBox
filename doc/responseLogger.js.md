# `responseLogger.js` - Line-by-Line Explanation

This module provides Express middleware that intercepts JSON responses and injects debugging logs into the response body. This behavior is only active in development mode.

- **Line 1:** `import { getLogStore } from '../lib/logger.js';`
  - Imports the `getLogStore` function, which can retrieve the request-specific log array created by `requestLogger.js`.

- **Line 3:** `const isDevMode = process.env.NODE_ENV !== 'production';`
  - A constant `isDevMode` is created to store whether the application is running in a non-production environment. This avoids repeated checks of `process.env.NODE_ENV`.

- **Line 5-7:** `/** ... */`
  - A JSDoc comment block describing the purpose of the `responseLogger` middleware.

- **Line 8:** `function responseLogger(req, res, next) {`
  - Defines the middleware function `responseLogger`.

- **Line 9:** `if (!isDevMode) {`
  - Checks if the application is *not* in development mode.
- **Line 10:** `return next();`
  - If it's in production, the middleware does nothing and immediately passes control to the next handler.

- **Line 14:** `const originalJson = res.json;`
  - Stores a reference to the original `res.json` function. This is a common pattern in Express for "monkey-patching" or wrapping Express methods.

- **Line 16:** `res.json = function(body) {`
  - Overwrites the `res.json` function with a new, custom function. This new function will be called whenever a route handler calls `res.json(...)`.

- **Line 17:** `const logStore = getLogStore();`
  - Inside the custom `json` function, it retrieves the log store for the current request.

- **Line 20:** `if (logStore && typeof body === 'object' && body !== null && !Array.isArray(body)) {`
  - This condition checks three things:
    1.  `logStore`: Does a log store exist for this request?
    2.  `typeof body === 'object' && body !== null`: Is the response body an object (and not `null`)?
    3.  `!Array.isArray(body)`: Is the body not an array?
  - This ensures that the `_debug` logs are only added to standard JSON object responses, not to arrays or other data types.

- **Line 21:** `body._debug = logStore;`
  - If the conditions are met, it adds a new property `_debug` to the response `body` object, with its value being the array of log messages collected during the request.

- **Line 24:** `return originalJson.call(this, body);`
  - Calls the original `res.json` function that was saved earlier. `this` is used to maintain the correct context for the `res` object, and the (potentially modified) `body` is passed along. This sends the final response to the client.

- **Line 27:** `next();`
  - After setting up the `res.json` wrapper, `next()` is called to pass control to the next middleware or route handler. The wrapper will remain in place and will execute when a response is eventually sent.

- **Line 30-32:** `export { ... };`
  - Exports the `responseLogger` middleware for use in the main application setup.
