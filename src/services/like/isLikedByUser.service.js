import { Like } from "../../models/Likes.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

export const isLikeByUser = async (videoId, commentId, userId) => {
  try {
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!videoId && !commentId) {
      throw new ApiError(401, "Error in params");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    const query = { userliked: userId };
    if (videoId) query.video = videoId;
    if (commentId) query.comment = commentId;

    const LikePresented = await Like.findOne(query);

    return !!LikePresented;
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
};
