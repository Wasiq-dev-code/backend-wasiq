import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/Likes.model.js";

export const videoLikeDelete = async ({ userId, videoId, commentId }) => {
  try {
    if (!videoId && !commentId) {
      throw new ApiError(400, "Videoid or Commentid should available");
    }

    if (!userId) {
      throw new ApiError(400, "Unauthorized Req");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    await Like.deletedLike(videoId, commentId, userId);

    return true;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Server contain error at likeAdded service");
  }
};
