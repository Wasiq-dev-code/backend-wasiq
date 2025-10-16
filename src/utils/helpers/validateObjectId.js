import mongoose from "mongoose";
import { ApiError } from "../Api/ApiError.js";

/**
 * @function validateObjectId
 *
 * Validate a value as a MongoDB ObjectId and return a mongoose ObjectId   instance.
 * Throws ApiError(400) when the input is missing or not a valid ObjectId.
 * Returns a new mongoose.Types.ObjectId instance when validation succeeds.
 *
 * @param {string|any} id - Value to validate as ObjectId (usually a string)
 * @param {string} [name='id'] - Exact id name used in error message for clarity.
 * @returns {mongoose.Types.ObjectId} A mongoose ObjectId instance for the provided id
 * @throws {ApiError} When id is falsy or not a valid ObjectId
 *
 * @example
 * // Valid id
 * const objectId = validateObjectId("64f0c0a1a2b3c4d5e6f7a8b", "videoId");
 *
 * @example
 * // Invalid id -> throws ApiError(400, "videoId is not an ObjectId")
 * validateObjectId("not-an-id", "videoId");
 */

export const validateObjectId = (id, name) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `${name} is not an ObjectId`);
  }
  return new mongoose.Types.ObjectId(id);
};
