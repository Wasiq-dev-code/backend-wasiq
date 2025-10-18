/**
 * @function generateAcessAndRefreshAtoken
 *
 * Helper utility for generating tokens for better and secure authentication.
 *
 * @description
 * Generates a new **Access Token** and **Refresh Token** for a given user, saves the refresh token in the database, and returns both tokens.
 *
 * @purpose
 * 1. Finds the user by `userId`.
 * 2. Generates JWT tokens using user instance methods (`generateAccessToken` and `generateRefreshToken`).
 * 3. Stores the new refresh token in the user's document (without validation).
 * 4. Returns both tokens for client-side authentication and session management.
 *
 * @param {mongoose.Types.ObjectId | string} userId - The unique Userid of the user for whom tokens will be generated.
 *
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 * Returns an object containing the generated `accessToken` and `refreshToken`.
 *
 * @throws {ApiError}
 * ApiError(500, "error while creating tokens")` if the user does not exist.
 * ApiError(500, "Token generation failed")` if token creation fails.
 * ApiError(500, "something went wrong")` for unexpected errors.
 *
 * @example
 * Example usage:
 * const { accessToken, refreshToken } = await generateAcessAndRefreshAtoken(user._id);
 * res.cookie("refreshToken", refreshToken, { httpOnly: true });
 * res.json({ accessToken });
 *
 * @note
 * Relies on `User` model instance methods:
 * user.generateAccessToken() and `user.generateRefreshToken()`.
 * The refresh token is saved to the user document for session persistence.
 * Uses a custom `ApiError` class for consistent error handling.
 * Disables validation before saving (`validateBeforeSave: false`) to speed up token updates.
 */

import mongoose from "mongoose";
import { User } from "../../modules/User/User.model.js";
import { ApiError } from "../Api/ApiError.js";

export const generateAcessAndRefreshAtoken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) throw new ApiError(500, "error while creating tokens");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new ApiError(500, "Token generation failed");
    }

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "something went wrong", error);
  }
};
