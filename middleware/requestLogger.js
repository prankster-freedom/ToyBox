'use strict';

const { asyncLocalStorage } = require('../lib/logger');

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

module.exports = {
  requestLogger,
};
