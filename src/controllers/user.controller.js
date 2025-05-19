import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { resgisterUser } from "../services/user/registerUser.service.js";
import { loginUser } from "../services/user/loginUser.service.js";
import { logoutUser } from "../services/user/logoutUser.service.js";
import { generateAccessToken } from "../services/user/generateAccessToken.service.js";
import { changeCurrentPassword } from "../services/user/changeCurrentPassword.service.js";
import { updateFields } from "../services/user/updateFields.service.js";
import { changeAvatar } from "../services/user/changeAvatar.service.js";
import { changeCoverImg } from "../services/user/changeCoverImg.service.js";
import { getUserChannelProfile } from "../services/user/getUserChannelProfile.service.js";
import { getUserHistory } from "../services/user/getUserHistory.service.js";

const registerUserController = asyncHandler(async (req, res) => {
  try {
    const { username, email, password, fullname } = req.body;
    const { files } = req;

    if (
      [username, email, password, fullname].some((val) => val?.trim() === "")
    ) {
      throw new ApiError(400, "fill all the fields");
    }

    if (!files) {
      throw new ApiError(404, "Files are not uploaded");
    }

    const createdUser = await resgisterUser({
      username,
      email,
      password,
      fullname,
      files,
    });

    if (!createdUser) {
      throw new ApiError(400, "Error while creating User");
    }

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

    if ([email, username, password].some((val) => val?.trim() === "")) {
      throw new ApiError(400, "please fill all required fields");
    }

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

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "logout user"));
});

const generateAccessTokenController = asyncHandler(async (req, res) => {
  try {
    const { body, cookies } = req;

    if (!body || !cookies) {
      throw new ApiError(400, "Unauthorized request");
    }

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

    if (!user) {
      throw new ApiError(401, "Unauthorized REQ");
    }

    if (!(oldPassword || newPassword)) {
      throw new ApiError(401, "fill all the fields");
    }

    await changeCurrentPassword({
      user,
      oldPassword,
      newPassword,
    });

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

    if (!(fullname || email)) {
      throw new ApiError(
        400,
        "please provide at least one field (fullname or email)"
      );
    }

    const user = await updateFields({
      fullname,
      email,
    });

    if (!user) {
      throw new ApiError(401, "database error");
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

    if ((!file, !user)) {
      throw new ApiError(500, "file or user are not available");
    }

    const userobj = await changeAvatar({
      file,
      user,
    });

    if (!userobj) {
      throw new ApiError(500, "server issue while operating Database");
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

    if ((!file, !user)) {
      throw new ApiError(500, "file or user are not available");
    }

    const userobj = await changeCoverImg({
      file,
      user,
    });

    if (!userobj) {
      throw new ApiError(500, "server issue while operating Database");
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

    if (!username.trim()) {
      throw new ApiError(400, "username should be pass through URL");
    }

    const channel = await getUserChannelProfile({
      username,
    });

    if (!channel.length) {
      throw new ApiError(400, "channel is not provided");
    }

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

    if (!user) {
      throw new ApiError(400, "Unauthorized REQ");
    }

    const userHistory = await getUserHistory({
      user,
    });

    if (!userHistory.watchHistory) {
      throw new ApiError(404, "User history is empty");
    }

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
