export const createError = (message, status = 500, options = {}) => {
    const error = new Error(message);
    error.status = status;
  
    if (options.code) {
      error.code = options.code; // custom internal error code, like 'USER_NOT_FOUND'
    }
  
    if (options.details) {
      error.details = options.details; // any extra info you want to pass
    }
  
    if (options.log) {
      console.error(`[Error] ${message} | Status: ${status}`, options.details || '');
    }
  
    return error;
  };