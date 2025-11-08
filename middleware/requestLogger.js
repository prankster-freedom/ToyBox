import { asyncLocalStorage } from '../lib/logger.js';

/**
 * Middleware to initialize the request-scoped log store.
 */
function requestLogger(req, res, next) {
  // Each request gets its own log store.
  const logStore = [];
  asyncLocalStorage.run(logStore, () => {
    next();
  });
}

export {
  requestLogger,
};
