import { getLogStore } from '../lib/logger.js';

const isDevMode = process.env.NODE_ENV !== 'production';

/**
 * Middleware to inject logs into the JSON response body in development mode.
 */
function responseLogger(req, res, next) {
  if (!isDevMode) {
    return next();
  }

  const originalJson = res.json;

  res.json = function(body) {
    const logStore = getLogStore();
    
    // Only inject logs if there's a log store and the body is a plain object
    if (logStore && typeof body === 'object' && body !== null && !Array.isArray(body)) {
      body._debug = logStore;
    }
    
    // Call the original res.json with the (potentially modified) body
    return originalJson.call(this, body);
  };

  next();
}

export {
  responseLogger,
};
