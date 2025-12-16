import { enter, exit, log } from '../lib/logger.js';

const isLocal = process.env.IS_LOCAL === 'true';

/**
 * Middleware to ensure a user is authenticated.
 * If not, it sends a 401 Unauthorized response.
 * In local environment (IS_LOCAL=true), this check is bypassed.
 */
function isAuthenticated(req, res, next) {
  const functionName = 'isAuthenticated';
  enter(functionName, { path: req.path });

  // Bypass authentication in local environment
  // REMOVED: Auto-injection of mock user prevents checking logout functionality.
  // Instead, we will handle mock login in the /auth/google route in index.js.
  /*
  if (isLocal) {
    log('Bypassing authentication in local environment.');
    // ...
    return next();
  }
  */

  if (req.isAuthenticated()) {
    exit(functionName, { result: 'authenticated' });
    return next();
  }
  
  exit(functionName, { result: 'unauthenticated' });
  res.status(401).json({ message: 'Unauthorized' });
}

export {
  isAuthenticated,
};
