import { enter, exit, log } from '../lib/logger.js';

/**
 * Middleware to ensure a user is authenticated.
 * If not, it sends a 401 Unauthorized response.
 * In development mode, this check is bypassed.
 */
function isAuthenticated(req, res, next) {
  const functionName = 'isAuthenticated';
  enter(functionName, { path: req.path });

  // Bypass authentication in development mode
  if (process.env.NODE_ENV !== 'production') {
    log('Bypassing authentication in development mode.');
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
