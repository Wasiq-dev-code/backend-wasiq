import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary.js";

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
