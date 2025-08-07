import { Comment } from "../../models/Comment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const getCommentByVideo = async ({ videoId }) => {
  try {
    if (!videoId) throw new ApiError(401, "videoId is not available");

    validateObjectId(videoId, "videoId");

    const comment = await Comment.find({ commentedvideo: videoId });
    if (!comment) throw new ApiError(404, "Comment not found");

    return comment;
  } catch (error) {
    console.error(error, "server is not responding");
  }
};
