import jwt from "jsonwebtoken";
import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAcessAndRefreshAtoken } from "./helper/generatingJWTTokens.service.js";

export const generateAccessToken = async ({ body, cookies }) => {
  try {
    if (!body || !cookies) {
      throw new ApiError(400, "Unauthorized request");
    }

    const rawRefreshToken = cookies?.refreshToken || body?.refreshToken;

    if (!rawRefreshToken) {
      throw new ApiError(401, "user is unauthorized");
    }

    const encodedRefreshToken = jwt.verify(
      rawRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(encodedRefreshToken._id);

    if (!user) {
      throw new ApiError("false database Call");
    }

    if (rawRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "token is not matching");
    }

    const { accessToken, newRefreshToken } =
      await generateAcessAndRefreshAtoken(user._id);

    if (!(accessToken || newRefreshToken)) {
      throw new ApiError(500, "error while creating tokens");
    }

    return { accessToken, newRefreshToken };
  } catch (error) {
    console.error(
      "Error while executing generateAccessToken method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to generateAccessToken method");
  }
};
