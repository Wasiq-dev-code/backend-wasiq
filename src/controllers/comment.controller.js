import { addComment } from "../services/comment/addComment.service.js";
import { deleteComment } from "../services/comment/deleteComment.service.js";
import { getCommentByVideo } from "../services/comment/getCommentByVideo.service.js";
import { getReplyToComment } from "../services/comment/getReplyToComment.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCommentController = asyncHandler(async (req, res) => {
  try {
    const videoId = req.params?.videoId;
    const commentId = req.params?.commentId; // optional (for replies)
    const userId = req.user?._id;
    const { content } = req.body;

    const newComment = await addComment({
      videoId,
      userId,
      content,
      commentId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newComment, "Comment added successfully"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const deleteCommentController = asyncHandler(async (req, res) => {
  try {
    const commentId = req.params?.commentId; // optional (for replies)
    const userId = req.user?._id;

    await deleteComment({
      userId,
      commentId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Comment deleted successfully"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const getCommentByVideoController = asyncHandler(async (req, res) => {
  try {
    const videoId = req.params?.videoId;

    const comments = await getCommentByVideo({
      videoId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, comments, "all comments of videos"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const getReplyToCommentController = asyncHandler(async (req, res) => {
  try {
    const commentId = req.params?.commentId;

    const replies = await getReplyToComment({
      commentId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, replies, "all replies of comments"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

export {
  addCommentController,
  deleteCommentController,
  getCommentByVideoController,
  getReplyToCommentController,
};
