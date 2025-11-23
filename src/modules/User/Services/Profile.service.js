import { User } from "../User.model.js";
import { ApiError } from "../../../utils/Api/ApiError.js";
import {
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../../utils/helpers/cloudinary.js";
import mongoose from "mongoose";

export const changeCurrentPassword = async ({
  user,
  oldPassword,
  newPassword,
}) => {
  if (!user) {
    throw new ApiError(401, "Unauthorized REQ");
  }

  if (!oldPassword || !newPassword) {
    throw new ApiError(401, "fill all the fields");
  }

  const userObject = await User.findById(user?._id);

  if (!userObject) {
    throw new ApiError(500, "database error");
  }

  const checkedPassword = await userObject.isPasswordCorrect(oldPassword);

  if (!checkedPassword) {
    throw new ApiError(401, "your old password is not matched");
  }

  userObject.password = newPassword;
  await userObject.save({ validateBeforeSave: false });

  return true;
};

export const updateFields = async ({ fullname, email, userId }) => {
  if (!userId) {
    throw new ApiError(400, "Unauthorized request");
  }

  if (!fullname || !email) {
    throw new ApiError(
      400,
      "please provide at least one field (fullname or email)"
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { fullname, email } },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -avatar_publicId -coverImg_publicId -__v");

  if (!user) {
    throw new ApiError(401, "database error");
  }

  return user;
};

export const changeAvatar = async ({ file, userId }) => {
  if (!userId) {
    throw new ApiError(400, "Unauthorized User");
  }

  if (!file) {
    throw new ApiError(400, "File is required");
  }

  const avatarLocalPath = file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar not found, File Path issue");
  }

  const userObject = await User.findById(userId);

  if (!userObject) {
    throw new ApiError(400, "User not found DB issue");
  }

  const old_public_id = userObject.avatar_publicId;

  const avatarUploadOnCloudinary = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarUploadOnCloudinary || !avatarUploadOnCloudinary.url) {
    throw new ApiError(500, "Not uploaded on Cloudinary ");
  }

  if (old_public_id) {
    await deleteOnCloudinary(old_public_id, "image");
  }

  const userObj = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        avatar: avatarUploadOnCloudinary.url,
        avatar_publicId: avatarUploadOnCloudinary.public_id,
      },
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -avatar_publicId -coverImg_publicId -__v");

  if (!userObj) {
    throw new ApiError(500, "User not found, DB Issue");
  }

  return userObj;
};

export const changeCoverImg = async ({ file, userId }) => {
  if (!userId) {
    throw new ApiError(400, "Unauthorized User");
  }

  if (!file) {
    throw new ApiError(400, "File is required");
  }

  const coverImgLocalPath = file?.path;

  if (!coverImgLocalPath) {
    throw new ApiError(401, "CoverImg Required");
  }

  const userObject = await User.findById(userId);

  if (!userObject) {
    throw new ApiError(400, "User not found DB issue");
  }

  const old_public_id = userObject.coverImg_publicId;

  const coverImgUploadOnCloudinary =
    await uploadOnCloudinary(coverImgLocalPath);

  if (
    !coverImgUploadOnCloudinary?.url ||
    !coverImgUploadOnCloudinary?.public_id
  ) {
    throw new ApiError(500, "Not uploaded on cloudinary");
  }

  if (old_public_id) {
    await deleteOnCloudinary(old_public_id, "image");
  }

  const userObj = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        coverImg: coverImgUploadOnCloudinary.url,
        coverImg_publicId: coverImgUploadOnCloudinary.public_id,
      },
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -avatar_publicId -coverImg_publicId -__v");

  if (!userObj) {
    throw new ApiError(500, "User not found, DB Issue");
  }

  return userObj;
};

export const getUserChannelProfile = async ({ username, userId }) => {
  if (!username.trim()) {
    throw new ApiError(400, "username should be pass through URL");
  }

  const channel = await User.aggregate([
    // Find the channel/user whose profile is being viewed
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },

    // Lookup subscribers of this channel — return ONLY a count
    {
      $lookup: {
        from: "subscriptions",
        let: { subscriberId: "$_id" }, // current channel ID
        pipeline: [
          { $match: { $expr: { $eq: ["$channel", "$$subscriberId"] } } },
          { $count: "count" },
        ],
        as: "subscribersCount",
      },
    },

    // Lookup channels THIS user has subscribed to (for subscribeToCount)
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribeTo",
      },
    },

    // Lookup ALL subscribers of this channel (full list, not count)
    // Required to check: is the logged-in user inside the subscribers list?
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "TotalSubscribers",
      },
    },

    // Build calculated fields
    {
      $addFields: {
        // subscribersCount: get first element from array — OR return 0 if none
        subscribersCount: {
          $ifNull: [{ $first: "$subscribersCount" }, 0],
        },

        // subscribeToCount: number of channels this user has subscribed to
        subscribeToCount: {
          $size: "$SubscribeTo",
        },

        // isSubscribed: true if logged-in user ID exists inside "TotalSubscribers" list
        isSubscribed: {
          $in: [
            userId, // logged-in user ID
            {
              $map: {
                input: "$TotalSubscribers", // array of subscription documents
                as: "ts",
                in: "$$ts.subscriber", // extract only subscriber IDs
              },
            },
          ],
        },
      },
    },

    // 6️⃣ Return only required fields to frontend
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

  return channel;
};

export const getUserHistory = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(400, "Unauthorized Req");
  }

  const userHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
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
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        password: 0,
        refreshToken: 0,
        email: 0,
        avatar_publicId: 0,
        coverImg_publicId: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
        username: 0,
        fullname: 0,
        avatar: 0,
        coverImg: 0,
      },
    },
  ]);

  if (!userHistory) {
    throw new ApiError(404, "User history is empty");
  }

  return userHistory;
};
