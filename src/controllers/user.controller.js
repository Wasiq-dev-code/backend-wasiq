import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAcessAndRefreshAtoken = async (userId) => {
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

const registerUser = asyncHandler(async (req, res) => {
  // console.log("req.files", req.files || req.files);
  // get user details
  const { username, email, password, fullname } = req.body;

  // check the detail is valid?
  if ([username, email, password, fullname].some((val) => val?.trim() === "")) {
    throw new ApiError(400, "fill all the fields");
  }

  // check is user exist?
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(400, "user already exist");
  }

  // check avatar and cover photo is available?

  const avatarLocalPath = await req.files?.avatar[0]?.path;
  const coverImgLocalPath = (await req.files?.coverImg?.[0]?.path) || "";

  if (!avatarLocalPath) {
    throw new ApiError(409, "avatar is not available");
  }

  // upload both files to cloudinary if exist

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  // console.log("avatarUpload", avatarUpload);

  if (!avatarUpload || !avatarUpload.url || !avatarUpload.public_id) {
    throw new ApiError(400, "avatar upload failed");
  }

  // optional coverIMG
  let coverImgUpload = null;
  if (coverImgLocalPath) {
    coverImgUpload = await uploadOnCloudinary(coverImgLocalPath);
  }

  // create user object-now put entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    fullname,
    avatar: avatarUpload.url,
    avatar_publicId: avatarUpload.public_id,
    coverImg: coverImgUpload?.url || "",
    coverImg_publicId: coverImgUpload?.public_id || "",
  });

  if (!user) throw new ApiError(500, "server issue");

  // check if user not exist in db
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "server issue");
  }

  // return res except password and token
  return res
    .status(200)
    .json(new ApiResponse(201, createdUser, "sucessful response"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
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
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

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

const generateAccessToken = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!rawRefreshToken) {
    throw new ApiError(401, "user is unauthorized");
  }

  try {
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
    throw new ApiError(500, error?.message || "server crash ");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword || newPassword)) {
    throw new ApiError(401, "fill all the fields");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(500, "database error");
  }

  const checkedPassword = await user.isPasswordCorrect(oldPassword);

  if (!checkedPassword) {
    throw new ApiError(401, "your old password is not matched");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password is changed successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user is successfully fetched"));
});

const updateFields = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!(fullname || email)) {
    throw new ApiError(
      400,
      "please provide at least one field (fullname or email)"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullname, email } },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(401, "database error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "fields change successfully"));
});

const changeAvatar = asyncHandler(async (req, res) => {
  let avatarLocalPath;
  if (
    req.file &&
    Array.isArray(req.file.avatar) &&
    req.file.avatar[0] &&
    req.file.avatar[0].path
  ) {
    avatarLocalPath = req.file.avatar[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(401, "avatar is not found");
  }

  const userObject = await User.findById(req.user?._id);

  if (!userObject) {
    throw new ApiError(500, "userObject is not found server issue");
  }

  const old_public_id = userObject.avatar_publicId;

  const avatarUploadOnCloudinary = await uploadOnCloudinary(avatarLocalPath);

  if (!(avatarUploadOnCloudinary || avatarUploadOnCloudinary.url)) {
    throw new ApiError(500, "server issue while cloudinary ");
  }

  if (old_public_id) {
    await deleteOnCloudinary(old_public_id);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUploadOnCloudinary.url,
        avatar_publicId: avatarUploadOnCloudinary.public_id,
      },
    },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(500, "server issue while operating Database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "avatar changed successfully"));
});

const changeCoverImg = asyncHandler(async (req, res) => {
  let coverImgLocalPath;
  if (
    req.file &&
    Array.isArray(req.file.coverImg) &&
    req.file.coverImg[0] &&
    req.file.coverImg[0].path
  ) {
    coverImgLocalPath = req.file.coverImg[0].path;
  }

  if (!coverImgLocalPath) {
    throw new ApiError(401, "avatar is not found");
  }

  const userObject = await User.findById(req.user?._id);
  if (!userObject) {
    throw new ApiError(500, "userObject is not found server issue");
  }

  const old_public_id = userObject.coverImg_publicId;

  const coverImgUploadOnCloudinary =
    await uploadOnCloudinary(coverImgLocalPath);

  if (
    !coverImgUploadOnCloudinary?.url ||
    !coverImgUploadOnCloudinary?.public_id
  ) {
    throw new ApiError(500, "server issue while cloudinary ");
  }

  if (old_public_id) {
    await deleteOnCloudinary(old_public_id);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImg: coverImgUploadOnCloudinary.url,
        coverImg_publicId: coverImgUploadOnCloudinary.public_id,
      },
    },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(500, "server issue while operating Database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "avatar changed successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username.trim()) {
    throw new ApiError(400, "username should be pass through URL");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id", //must read about
        foreignField: "channel",
        as: "Totalsubscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribeTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$Totalsubscribers",
        },
        subscribeToCount: {
          $size: "$SubscribeTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$Totalsubscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullname: 1,
        coverImg: 1,
        avatar: 1,
        subscribersCount: 1,
        subscribeToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(400, "channel is not provided");
  }

  return res
    .status()
    .json(new ApiResponse(200, channel[0], "channel is provided"));
});

const getUserHistory = asyncHandler(async (req, res) => {
  const userHistory = User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, userHistory.watchHistory, "userWatchHistory"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  generateAccessToken,
  changeCurrentPassword,
  getUser,
  updateFields,
  changeAvatar,
  changeCoverImg,
  getUserChannelProfile,
  getUserHistory,
};
