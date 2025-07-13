import { Comment } from "../../models/Comment.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

export const editComment = async ({ userId, content, commentId }) => {
  try {
    if (!userId) throw new ApiError(400, "Unauthorized Request");
    if (!content?.trim()) throw new ApiError(400, "Content cannot be empty");
    if (!commentId) throw new ApiError(400, "CommentID is not available");

    validateObjectId(userId, "User Id");
    validateObjectId(commentId, "comment Id");

    const comment = await Comment.findById(commentId);

    if (!comment) throw new ApiError(404, "Comment not found");

    if (comment.commentedby.toString() !== userId.toString()) {
      throw new ApiError(401, "you can only edit your comment");
    }

    comment.content = content.trim();
    await comment.save();

    return comment;
  } catch (error) {
    console.error(error, "server is not responding");
    throw new ApiError(500, "Server is down");
  }
};
