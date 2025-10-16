/**
 * @function asyncHandler
 * @description Utility to wrap async function in asynchandler to provide better error monitoring specially for controller and services. No need to Try/Catch after wrapping asynchandler.
 *
 * @param {Function} fn - Async function with signature. (req, res, next) => {}
 * @returns {Function} - Express-Compatible Middleware. (req, res, next) => {}
 *
 * // Usage example:
 *
 * import {asycnHandler} from "/asycnHandler.js"
 *
 * router.get("/users", asyncHandler(async(req, res, next) => {
 * // Existing code
 * }))
 */

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export { asyncHandler };
