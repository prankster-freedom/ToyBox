import { enter, exit } from '../lib/logger.js';

/**
 * Middleware to ensure a user is authenticated.
 * If not, it sends a 401 Unauthorized response.
 */
function isAuthenticated(req, res, next) {
  const functionName = 'isAuthenticated';
  enter(functionName, { path: req.path });

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
