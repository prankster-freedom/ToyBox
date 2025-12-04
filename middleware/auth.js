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
  if (isLocal) {
    log('Bypassing authentication in local environment.');
    // In dev mode, we might not have a real user object.
    // We can create a mock user for consistent behavior downstream.
    if (!req.user) {
      req.user = {
        "id": "test-user-id",
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
      };
    }
    exit(functionName, { result: 'bypassed_in_dev' });
    return next();
  }

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
