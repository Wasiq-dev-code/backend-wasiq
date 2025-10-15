/**
 * @class ApiError
 * @extends Error
 * @classdesc An error object to return when result comes to negative
 *
 * @example
 * // Usage Example!
 * throw new ApiError(500, "server is not responding", [], "", null);
 *
 * Expecting Response!
 * {
 *   "success": false,
 *   "statusCode": 500,
 *   "message": "server is not responding",
 *   "error": [],
 *   "data": null,
 *   "errorCode": "USER_NOT_FOUND"
 * }
 */

class ApiError extends Error {
  /** Creates an instance of ApiError
   *
   * @param {number} statusCode - HTTP statusCode for representing the type of error(eg, 404, 401, 500).
   * @param {string} message [message = "something went wrong"] - Human readable message.
   * @param {Array|Object} error [error = []] - An Array or object for additional details.
   * @param {string} stack [stack = ""] - A stack trace, Automatically generated if not defined.
   * @param {String|null} errorCode - Optional custom application-specific error code (e.g., "USER_NOT_FOUND").
   */
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
