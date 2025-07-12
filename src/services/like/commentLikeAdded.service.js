import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/Likes.model.js";
import mongoose from "mongoose";

export const commentLikeAdded = async ({ commentID, UserID }) => {
  try {
    if (!commentID) {
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

    const safeCommentID = commentID
      ? mongoose.Types.ObjectId(commentID)
      : undefined;

    const liked = await Like.create({
      comment: safeCommentID,
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
