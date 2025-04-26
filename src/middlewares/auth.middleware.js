import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const JWTVerify = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("authorization")?.replace("bearer ", "");

    if (!token) {
      throw new ApiError(400, "need token");
    }

    const tokenUncoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(tokenUncoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(500, "db problem oops");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "user is unathorized");
  }
});
