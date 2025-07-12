import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/Likes.model.js";
import mongoose from "mongoose";

export const commentLikeDelete = async ({ commentID, UserID }) => {
  try {
    if (!commentID) {
      throw new ApiError(400, "Data has containing error");
    }

    if (!UserID) {
      throw new ApiError(400, "User has containing error");
    }

    const safeCommentID = mongoose.Types.ObjectId(commentID);

    const deletedLike = await Like.findOneAndDelete({
      comment: safeCommentID,
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
