import { Like } from "../../models/Likes.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const totalCommentLikes = async (commentId) => {
  try {
    if (!commentId) {
      throw new ApiError(400, "Comment ID is required");
    }

    validateObjectId(commentId, "Comment ID");

    const likeCount = await Like.countDocuments({ comment: commentId });

    return likeCount;
  } catch (error) {
    console.error(error.message || "Error in totalCommentLikes");
    throw new ApiError(500, "Server error while counting comment likes");
  }
};
