'use strict';

const isDevMode = process.env.NODE_ENV !== 'production';

/**
 * Logs a message if not in production mode.
 * @param {...any} args - The messages to log.
 */
function log(...args) {
  if (isDevMode) {
    // Simple log format for better readability
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}]`, ...args);
  }
}

/**
 * Logs function entry with arguments.
 * @param {string} functionName - The name of the function.
 * @param {object} [args={}] - The arguments of the function.
 */
function enter(functionName, args = {}) {
  if (isDevMode) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] ==> Entering ${functionName}`);
    if (Object.keys(args).length > 0) {
      try {
        // Use JSON.stringify to avoid issues with circular references
        const argsString = JSON.stringify(args, null, 2);
        console.log(`[DEBUG ${timestamp}]     Args: ${argsString}`);
      } catch (error) {
        console.log(`[DEBUG ${timestamp}]     Args: (Could not serialize)`);
      }
    }
  }
}

/**
 * Logs function exit with a return value.
 * @param {string} functionName - The name of the function.
 * @param {any} [returnValue] - The return value of the function.
 */
function exit(functionName, returnValue) {
  if (isDevMode) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] <== Exiting ${functionName}`);
    if (returnValue !== undefined) {
      try {
        // Use JSON.stringify for consistent output and to handle objects
        const returnString = JSON.stringify(returnValue, null, 2);
        console.log(`[DEBUG ${timestamp}]     Return: ${returnString}`);
      } catch (error) {
        console.log(`[DEBUG ${timestamp}]     Return: (Could not serialize)`);
      }
    }
  }
}

module.exports = {
  log,
  enter,
  exit,
  isDevMode,
};
