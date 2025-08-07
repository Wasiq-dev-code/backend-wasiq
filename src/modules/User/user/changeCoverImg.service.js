import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary.js";

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
