import { Comment } from "../../models/Comment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const addComment = async ({ videoId, userId, content, commentId }) => {
  try {
    if (!userId) throw new ApiError(401, "Unauthorized request");
    if (!content?.trim())
      throw new ApiError(400, "Comment content cannot be empty");
    if (!videoId) throw new ApiError(400, "Video ID is required");

    validateObjectId(videoId, "Video ID");
    validateObjectId(userId, "User ID");

    const query = {
      content: content.trim(),
      commentedvideo: videoId,
      commentedby: userId,
    };

    // If it's a reply
    if (commentId) {
      validateObjectId(commentId, "Comment ID");

      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        throw new ApiError(404, "Parent comment not found");
      }

      if (parentComment.commentedvideo.toString() !== videoId) {
        throw new ApiError(
          400,
          "Parent comment does not belong to the same video"
        );
      }

      query.parentcomment = commentId;
    }

    const newComment = await Comment.create(query);

    if (!newComment) {
      throw new ApiError(500, "Failed to create comment");
    }

    return newComment;
  } catch (error) {
    console.error(error, "server is not responding");
  }
};
