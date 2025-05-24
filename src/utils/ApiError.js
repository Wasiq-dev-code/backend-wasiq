/// @param {Error} is local class and node is providing to us,
/// @param {ApiError} mually built class whose handling error of depending which created this class manually, returning error message

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

  static CachingError(operation, detail) {
    return (
      new ApiError(500, `Caching Error ${operation}`),
      [detail],
      "",
      CACHE_ERROR_CODES[operation] || "CACHE_999"
    );
  }
}

export { ApiError };
