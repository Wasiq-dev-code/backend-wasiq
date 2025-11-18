import jwt from "jsonwebtoken";
import { User } from "../modules/User/User.model.js";
import { ApiError } from "../utils/Api/ApiError.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";

/**
 * Middleware to verify JWT tokens for protected routes.
 *
 * 🔒 Responsibilities:
 * 1. Extract the token from either cookies or the Authorization header.
 * 2. Validate the token using the secret key.
 * 3. Fetch the corresponding user from the database.
 * 4. Attach the user object to `req.user` for downstream access.
 *
 * 💡 Usage:
 * Simply attach this middleware to any route that requires authentication:
 * ```js
 * router.get("/profile", JWTVerify, profileController);
 * ```
 *
 * ⚠️ Expected Header Format:
 * ```
 * Authorization: Bearer <access_token>
 * ```
 */
export const JWTVerify = asyncHandler(async (req, _, next) => {
  try {
    // Extract token from either cookie or Authorization header
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.accessToken ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1] // Remove the "Bearer " prefix
        : null);

    // If token is missing or invalid format
    if (!token) {
      throw new ApiError(401, "Access token missing or invalid format");
    }

    // Verify the token and decode payload
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Retrieve user details (excluding sensitive fields)
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    // If user not found in database
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Attach user object to request for further use
    req.user = user;
    next();
  } catch (error) {
    console.error("JWTVerify Error:", error.message);
    throw new ApiError(401, error?.message || "Unauthorized user");
  }
});
