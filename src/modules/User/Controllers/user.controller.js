import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { resgisterUser } from "./user/registerUser.service.js";
import { loginUser } from "./user/loginUser.service.js";
import { logoutUser } from "./user/logoutUser.service.js";
import { generateAccessToken } from "./user/generateAccessToken.service.js";
import { changeCurrentPassword } from "./user/changeCurrentPassword.service.js";
import { updateFields } from "./user/updateFields.service.js";
import { changeAvatar } from "./user/changeAvatar.service.js";
import { changeCoverImg } from "./user/changeCoverImg.service.js";
import { getUserChannelProfile } from "./user/getUserChannelProfile.service.js";
import { getUserHistory } from "./user/getUserHistory.service.js";
import { clearUserCache } from "../../utils/redisChachingKeyStructure.js";

const registerUserController = asyncHandler(async (req, res) => {
  try {
    const { username, email, password, fullname } = req.body;
    const { files } = req;

    const createdUser = await resgisterUser({
      username,
      email,
      password,
      fullname,
      files,
    });

    return res
      .status(200)
      .json(new ApiResponse(201, createdUser, "sucessful response"));
  } catch (error) {
    console.error(
      "Error while executing registerUserController method",
      error?.stack || error
    );
    throw new ApiError(500, "server is down while creating user");
  }
});

const loginUserController = asyncHandler(async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const { isLoggedIn, accessToken, refreshToken } = await loginUser({
      email,
      username,
      password,
    });

    if (!isLoggedIn || !accessToken || !refreshToken) {
      throw new ApiError(500, "Error in user login method");
    }

    // adding cookies
    const option = {
      httpOnly: true,
      secure: true,
    };

    try {
      await clearUserCache(isLoggedIn?._id);
    } catch (error) {
      console.error(
        "Error while caching user after login",
        error?.stack || error
      );
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            isLoggedIn,
            accessToken,
            refreshToken,
          },
          "successfull login user"
        )
      );
  } catch (error) {
    console.error(
      "Error while executing loginUserController method",
      error?.stack || error
    );
    throw new ApiError(500, "server is down while login user");
  }
});

const logoutUserController = asyncHandler(async (req, res) => {
  await logoutUser(req?.user?._id);

  const option = {
    httpOnly: true,
    secure: true,
    // sameSite: "strict",
  };

  try {
    await clearUserCache(req?.user?._id);
  } catch (error) {
    console.error(
      "Error while caching user after logout",
      error?.stack || error
    );
  }

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "logout user"));
});

const generateAccessTokenController = asyncHandler(async (req, res) => {
  try {
    const { body, cookies } = req;

    const { accessToken, newRefreshToken } = await generateAccessToken({
      body,
      cookies,
    });

    if (!accessToken || !newRefreshToken) {
      throw new ApiError(500, "error while creating tokens");
    }

    const option = {
      httpOnly: true,
      secure: true,
      // sameSite: "strict",
    };

    try {
      await clearUserCache(req?.user?._id);
    } catch (error) {
      console.error(
        "Error while caching after providing tokens",
        error?.stack || error
      );
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "token generated successfully"
        )
      );
  } catch (error) {
    console.error(
      "Error while executing generateAccessTokenController",
      error?.stack || error
    );
    throw new ApiError(
      500,
      "Server is down due to generateAccessTokenController"
    );
  }
});

const changeCurrentPasswordController = asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { oldPassword, newPassword } = req.body;

    await changeCurrentPassword({
      user,
      oldPassword,
      newPassword,
    });

    try {
      await clearUserCache(req?.user?._id);
    } catch (error) {
      console.error(
        "Error while caching after update password",
        error?.stack || error
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "password is changed successfully"));
  } catch (error) {
    console.error(
      "Error while executing changeCurrentPassword Controller",
      error?.stack || error
    );
    throw new ApiError(
      500,
      "Server is down due to changeCurrentPassword Controller"
    );
  }
});

const getUserController = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req?.user, "user is successfully fetched"));
});

const updateFieldsController = asyncHandler(async (req, res) => {
  try {
    const { fullname, email } = req.body;

    const user = await updateFields({
      fullname,
      email,
    });

    try {
      await clearUserCache(user?._id);
    } catch (error) {
      console.error(
        "Error while caching after update fields",
        error?.stack || error
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "fields change successfully"));
  } catch (error) {
    console.error(
      "Error while executing updateFieldsController",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to updateFieldsController");
  }
});

const changeAvatarController = asyncHandler(async (req, res) => {
  try {
    const { file, user } = req;

    const userobj = await changeAvatar({
      file,
      user,
    });

    try {
      await clearUserCache(userobj?._id);
    } catch (error) {
      console.error(
        "Error while caching user after avatar change",
        error?.stack || error
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, userobj, "avatar changed successfully"));
  } catch (error) {
    console.error(
      "Error while executing changeAvatarController",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to changeAvatarController");
  }
});

const changeCoverImgController = asyncHandler(async (req, res) => {
  try {
    const { file, user } = req;

    const userobj = await changeCoverImg({
      file,
      user,
    });

    try {
      await clearUserCache(userobj?._id);
    } catch (error) {
      console.error(
        "Error while caching user after changing coverimage",
        error?.stack || error
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, userobj, "coverImage changed successfully"));
  } catch (error) {
    console.error(
      "Error while executing changeCoverImgController",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to changeCoverImgController");
  }
});

/// @param: Completed The Authentication Operations

const getUserChannelProfileController = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    const channel = await getUserChannelProfile({
      username,
    });

    return res
      .status()
      .json(new ApiResponse(200, channel[0], "channel is provided"));
  } catch (error) {
    console.error(
      "Error while executing getUserChannelProfileController",
      error?.stack || error
    );
    throw new ApiError(
      500,
      "Server is down due to getUserChannelProfileController"
    );
  }
});

const getUserHistoryController = asyncHandler(async (req, res) => {
  try {
    const { user } = req;

    const userHistory = await getUserHistory({
      user,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, userHistory.watchHistory, "userWatchHistory"));
  } catch (error) {
    console.error(
      "Error while executing getUserHistoryController",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to getUserHistoryController");
  }
});

export {
  registerUserController,
  loginUserController,
  logoutUserController,
  generateAccessTokenController,
  changeCurrentPasswordController,
  getUserController,
  updateFieldsController,
  changeAvatarController,
  changeCoverImgController,
  getUserChannelProfileController,
  getUserHistoryController,
};
