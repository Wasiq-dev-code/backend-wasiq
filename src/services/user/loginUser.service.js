import { User } from "../../models/User.model";
import { ApiError } from "../../utils/ApiError";
import { generateAcessAndRefreshAtoken } from "./helper/generatingJWTTokens.service";

export const loginUser = async ({ email, username, password }) => {
  try {
    if ([email, username, password].some((val) => val?.trim() === "")) {
      throw new ApiError(400, "please fill all required fields");
    }

    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      throw new ApiError(400, "user is not available");
    }

    const passwordChecking = await user.isPasswordCorrect(password);

    if (!passwordChecking) {
      throw new ApiError(400, "password is not correct");
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshAtoken(
      user._id
    );
    if (!accessToken || !refreshToken) {
      throw new ApiError(500, "error while fetching tokens");
    }
    // returning current object values accept password and refreshtoken
    const isLoggedIn = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!isLoggedIn) throw new ApiError(500, "Api not found");

    return { isLoggedIn, accessToken, refreshToken };
  } catch (error) {
    console.error(
      "Error while executing loginUser method",
      error?.stack || error
    );
    throw new ApiError(500, "server is down while login user");
  }
};
