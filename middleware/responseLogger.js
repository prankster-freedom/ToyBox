import { getLogStore } from '../lib/logger.js';

const enableDebugLogs = process.env.ENABLE_DEBUG_LOGS !== 'false';

/**
 * Middleware to inject logs into the JSON response body.
 * Controlled by ENABLE_DEBUG_LOGS environment variable (default: true).
 */
function responseLogger(req, res, next) {
  if (!enableDebugLogs) {
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
