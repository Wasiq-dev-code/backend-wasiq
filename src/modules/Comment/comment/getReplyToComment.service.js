import { Comment } from "../../models/Comment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const getReplyToComment = async ({ commentId }) => {
  try {
    if (!commentId) throw new ApiError(401, "commentId is not available");

    validateObjectId(commentId, "commentId");

    const replies = await Comment.find({ parentcomment: commentId });
    if (!replies) throw new ApiError(404, "replies not found");

    return replies;
  } catch (error) {
    console.error(error, "server is not responding");
  }
};
