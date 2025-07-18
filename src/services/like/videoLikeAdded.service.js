import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/Likes.model.js";
import mongoose from "mongoose";

export const videoLikeAdded = async ({ videoID, UserID }) => {
  try {
    if (!videoID) {
      throw new ApiError(
        400,
        "Data has containing error from likeAddedContr0ller"
      );
    }

    if (!UserID) {
      throw new ApiError(
        400,
        "User has containing error from likeAddedContr0ller"
      );
    }

    const safeVideoId = videoID ? mongoose.Types.ObjectId(videoID) : undefined;

    const liked = await Like.create({
      video: safeVideoId,
      userliked: UserID,
    });

    if (!liked) {
      throw new ApiError(500, "Error Occured while establishing Liked Schema ");
    }

    return true;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Server contain error at likeAdded service");
  }
};
