import { createError } from './index.js';

const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export const checkRateLimit = (key) => {
  const now = Date.now();
  const attemptData = loginAttempts.get(key) || { count: 0, lastAttempt: now };

  if (now - attemptData.lastAttempt > WINDOW_MINUTES * 60 * 1000) {
    // Reset the attempt count after time window has passed
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return;
  }

  if (attemptData.count >= MAX_ATTEMPTS) {
    // If the user has exceeded the max attempts, throw an error
    throw createError(
      `Too many login attempts. Try again in ${WINDOW_MINUTES} minutes.`,
      429,
      {
        code: 'TOO_MANY_ATTEMPTS',
      }
    );
  }

  // Otherwise, increment count
  loginAttempts.set(key, {
    count: attemptData.count + 1,
    lastAttempt: now,
  });
};

export const resetRateLimit = (key) => {
  loginAttempts.delete(key);
};
