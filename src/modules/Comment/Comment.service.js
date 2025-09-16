import { Comment } from "./Comment.model.js";
import { ApiError } from "../../utils/Api/ApiError.js";
import { validateObjectId } from "../../utils/helpers/validateObjectId.js";

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

export const myComment = async ({ userId }) => {
  try {
    if (!userId) throw new ApiError(401, "Unauthorized Request");

    validateObjectId(userId, "userId");

    const myCommentList = await Comment.find({ commentedby: userId });

    if (!myCommentList) throw new ApiError(404, "Comments not found");

    return myCommentList;
  } catch (error) {
    console.error(error, "server is not responding");
  }
};
