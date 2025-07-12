import { Comment } from "../../models/Comment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const deleteComment = async ({ commentId, userId }) => {
  try {
    if (!commentId) throw new ApiError(400, "Comment ID is required");
    if (!userId) throw new ApiError(401, "Unauthorized");

    validateObjectId(commentId, "Comment ID");
    validateObjectId(userId, "User ID");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    if (comment.commentedby.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await comment.deleteOne();

    return true;
  } catch (error) {
    console.error(error, "server is not responding");
  }
};
