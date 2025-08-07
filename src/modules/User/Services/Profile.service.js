import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary.js";

export const changeCurrentPassword = async ({
  user,
  oldPassword,
  newPassword,
}) => {
  try {
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
  } catch (error) {
    console.error(
      "Error while executing changeCurrentPassword method",
      error?.stack || error
    );
    throw new ApiError(
      500,
      "Server is down due to changeCurrentPassword method"
    );
  }
};

export const updateFields = async ({ fullname, email }) => {
  try {
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

    return user;
  } catch (error) {
    console.error(
      "Error while executing updateFields method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to updateFields method");
  }
};

export const changeAvatar = async ({ file, user }) => {
  try {
    if ((!file, !user)) {
      throw new ApiError(500, "file or user are not available");
    }

    const avatarLocalPath = file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(401, "avatar is not found");
    }

    const userObject = await User.findById(user?._id);

    if (!userObject) {
      throw new ApiError(500, "userObj is not found server issue");
    }

    const old_public_id = userObject.avatar_publicId;

    const avatarUploadOnCloudinary = await uploadOnCloudinary(avatarLocalPath);

    if (!(avatarUploadOnCloudinary || avatarUploadOnCloudinary.url)) {
      throw new ApiError(500, "server issue while cloudinary ");
    }

    if (old_public_id) {
      await deleteOnCloudinary(old_public_id);
    }

    const userObj = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          avatar: avatarUploadOnCloudinary.url,
          avatar_publicId: avatarUploadOnCloudinary.public_id,
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!userObj) {
      throw new ApiError(500, "server issue while operating Database");
    }

    return userObj;
  } catch (error) {
    console.error(
      "Error while executing changeAvatar method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to changeAvatar method");
  }
};

export const changeCoverImg = async ({ file, user }) => {
  try {
    if ((!file, !user)) {
      throw new ApiError(500, "file or user are not available");
    }

    const coverImgLocalPath = file?.path;

    if (!coverImgLocalPath) {
      throw new ApiError(401, "avatar is not found");
    }

    const userObject = await User.findById(user?._id);
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

    const userobj = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          coverImg: coverImgUploadOnCloudinary.url,
          coverImg_publicId: coverImgUploadOnCloudinary.public_id,
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!userobj) {
      throw new ApiError(500, "server issue while operating Database");
    }

    return userobj;
  } catch (error) {
    console.error(
      "Error while executing changeCoverImg method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to changeCoverImg method");
  }
};

export const getUserChannelProfile = async ({ username }) => {
  try {
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

    return channel;
  } catch (error) {
    console.error(
      "Error while executing getUserChannelProfile method",
      error?.stack || error
    );
    throw new ApiError(
      500,
      "Server is down due to getUserChannelProfile method"
    );
  }
};

export const getUserHistory = async ({ user }) => {
  try {
    if (!user) {
      throw new ApiError(400, "Unauthorized REQ");
    }

    const userHistory = await User.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(user._id),
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

    if (!userHistory) {
      throw new ApiError(404, "User history is empty");
    }

    return userHistory;
  } catch (error) {
    console.error(
      "Error while executing getUserHistory method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to getUserHistory method");
  }
};
