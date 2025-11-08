import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Gets the log store for the current request context.
 * @returns {Array<string>|undefined} The log array or undefined if not in a request context.
 */
function getLogStore() {
  return asyncLocalStorage.getStore();
}

/**
 * Logs a message to the current request's log store.
 * @param {...any} args - The messages to log.
 */
function log(...args) {
  const store = getLogStore();
  if (store) {
    const timestamp = new Date().toISOString();
    // Format message similar to console.log
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    store.push(`[DEBUG ${timestamp}] ${message}`);
  }
}

/**
 * Logs function entry with arguments.
 * @param {string} functionName - The name of the function.
 * @param {object} [argsObject={}] - The arguments of the function.
 */
function enter(functionName, argsObject = {}) {
  const store = getLogStore();
  if (store) {
    const timestamp = new Date().toISOString();
    store.push(`[DEBUG ${timestamp}] ==> Entering ${functionName}`);
    if (Object.keys(argsObject).length > 0) {
      try {
        const argsString = JSON.stringify(argsObject, null, 2);
        store.push(`[DEBUG ${timestamp}]     Args: ${argsString}`);
      } catch (error) {
        store.push(`[DEBUG ${timestamp}]     Args: (Could not serialize)`);
      }
    }
  }
}

/**
 * Logs function exit with a return value.
 * @param {string} functionName - The name of the function.
 *  @param {any} [returnValue] - The return value of the function.
 */
function exit(functionName, returnValue) {
  const store = getLogStore();
  if (store) {
    const timestamp = new Date().toISOString();
    store.push(`[DEBUG ${timestamp}] <== Exiting ${functionName}`);
    if (returnValue !== undefined) {
      try {
        const returnString = JSON.stringify(returnValue, null, 2);
        store.push(`[DEBUG ${timestamp}]     Return: ${returnString}`);
      } catch (error) {
        store.push(`[DEBUG ${timestamp}]     Return: (Could not serialize)`);
      }
    }
  }
}

export {
  asyncLocalStorage,
  getLogStore,
  log,
  enter,
  exit,
};