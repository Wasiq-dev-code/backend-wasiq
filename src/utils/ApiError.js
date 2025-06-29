export const CACHE_ERROR_CODES = {
  REDIS_CONNECTION: "REDIS_001",
  CACHE_SET: "CACHE_002",
  CACHE_GET: "CACHE_003",
  CACHE_DELETE: "CACHE_004",
  LOCK_ACQUIRE: "CACHE_005",
};

class ApiError extends Error {
  constructor(
    statusCode,
    message = "something went wrong",
    error = [],
    stack = "",
    errorCode = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.success = false;
    this.data = null;
    this.errorCode = errorCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
