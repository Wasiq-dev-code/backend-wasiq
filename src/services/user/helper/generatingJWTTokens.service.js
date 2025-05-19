import { User } from "../../../models/User.model";
import { ApiError } from "../../../utils/ApiError";

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
    throw new ApiError(500, "something went wrong", error);
  }
};
