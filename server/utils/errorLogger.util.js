export const logServiceError = (serviceName, error) => {
    console.error(`[${new Date().toISOString()}] ${serviceName} Error:`, {
      message: error.message,
      stack: error.stack,
      ...(error.status && { status: error.status }),
    });
  };