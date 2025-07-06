import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/Likes.model.js";
import mongoose from "mongoose";

export const videoLikeDelete = async (videoID, UserID) => {
  try {
    if (!videoID) {
      throw new ApiError(400, "Data has containing error");
    }

    if (!UserID) {
      throw new ApiError(400, "User has containing error ");
    }

    const safevideoID = mongoose.Types.ObjectId(videoID);

    const deletedLike = await Like.findOneAndDelete({
      video: safevideoID,
      userliked: UserID,
    });

    if (!deletedLike) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Server contain error at likeAdded service");
  }
};
