import { asyncHandler } from "../../utils/helpers/asyncHandler.js";
import { ApiError } from "../../utils/Api/ApiError.js";
import { ApiResponse } from "../../utils/Api/ApiResponse.js";
import {
  resgisterUser,
  loginUser,
  logoutUser,
  generateAccessToken,
} from "./Services/Auth.service.js";
import {
  changeCurrentPassword,
  updateFields,
  changeAvatar,
  changeCoverImg,
  getUserChannelProfile,
  getUserHistory,
} from "./Services/Profile.service.js";
import { clearUserCache } from "../../utils/Cache/redisChachingKeyStructure.js";
import { User } from "./User.model.js";

// Authentication Controllers
const registerUserController = asyncHandler(async (req, res) => {
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
});

const loginUserController = asyncHandler(async (req, res) => {
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

  // try {
  //   await clearUserCache(isLoggedIn?._id);
  // } catch (error) {
  //   console.error(
  //     "Error while caching user after login",
  //     error?.stack || error
  //   );
  // }

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
});

const logoutUserController = asyncHandler(async (req, res) => {
  await logoutUser(req?.user?._id);

  const option = {
    httpOnly: true,
    secure: true,
    // sameSite: "strict",
  };

  // try {
  //   await clearUserCache(req?.user?._id);
  // } catch (error) {
  //   console.error(
  //     "Error while caching user after logout",
  //     error?.stack || error
  //   );
  // }

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "logout user"));
});

const generateAccessTokenController = asyncHandler(async (req, res) => {
  const { body, cookies } = req;

  // console.log(body.refreshToken);

  const { accessToken, refreshToken } = await generateAccessToken({
    body,
    cookies,
  });

  // if (!accessToken || !newRefreshToken) {
  //   throw new ApiError(400, "error while creating tokens");
  // }

  const option = {
    httpOnly: true,
    secure: true,
  };

  // console.log(accessToken, RefreshToken);

  // try {
  //   await clearUserCache(req?.user?._id);
  // } catch (error) {
  //   console.error(
  //     "Error while caching after providing tokens",
  //     error?.stack || error
  //   );
  // }

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
        },
        "token generated successfully"
      )
    );
});

// Profile Controllers
const changeCurrentPasswordController = asyncHandler(async (req, res) => {
  const { user } = req;
  const { oldPassword, newPassword } = req.body;

  await changeCurrentPassword({
    user,
    oldPassword,
    newPassword,
  });

  // try {
  //   await clearUserCache(req?.user?._id);
  // } catch (error) {
  //   console.error(
  //     "Error while caching after update password",
  //     error?.stack || error
  //   );
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password is changed successfully"));
});

const getUserController = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -avatar_publicId -coverImg_publicId -__v"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "user is successfully fetched"));
});

const updateFieldsController = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  const userId = req.user._id;

  const user = await updateFields({
    fullname,
    email,
    userId,
  });

  // try {
  //   await clearUserCache(user?._id);
  // } catch (error) {
  //   console.error(
  //     "Error while caching after update fields",
  //     error?.stack || error
  //   );
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "fields change successfully"));
});

const changeAvatarController = asyncHandler(async (req, res) => {
  const { file } = req;
  const userId = req.user._id;

  const userobj = await changeAvatar({
    file,
    userId,
  });

  // try {
  //   await clearUserCache(userobj?._id);
  // } catch (error) {
  //   console.error(
  //     "Error while caching user after avatar change",
  //     error?.stack || error
  //   );
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, userobj, "avatar changed successfully"));
});

const changeCoverImgController = asyncHandler(async (req, res) => {
  const { file } = req;
  const userId = req.user.id;

  const userobj = await changeCoverImg({
    file,
    userId,
  });

  // try {
  //   await clearUserCache(userobj?._id);
  // } catch (error) {
  //   console.error(
  //     "Error while caching user after changing coverimage",
  //     error?.stack || error
  //   );
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, userobj, "coverImage changed successfully"));
});

const getUserChannelProfileController = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const userId = req.user._id;

  const channel = await getUserChannelProfile({
    username,
    userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "channel fetched successfully"));
});

const getUserHistoryController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userHistory = await getUserHistory({
    userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, userHistory.watchHistory, "userWatchHistory"));
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
