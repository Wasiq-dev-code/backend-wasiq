import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/Likes.model.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const videoLikeAdded = async ({ videoId, userId, commentId }) => {
  try {
    if (!videoId && !commentId) {
      throw new ApiError(400, "Videoid or Commentid should available");
    }

    if (!userId) {
      throw new ApiError(400, "Unauthorized Req");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    const liked = await Like.createLike(videoId, commentId, userId);

    if (!liked) {
      throw new ApiError(500, "Like is not added");
    }

    return true;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Server contain error at likeAdded service");
  }
};
