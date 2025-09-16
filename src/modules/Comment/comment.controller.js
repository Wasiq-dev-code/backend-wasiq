import {
  addComment,
  deleteComment,
  editComment,
  getCommentByVideo,
  getReplyToComment,
  myComment,
} from "./Comment.service.js";
import { ApiError } from "../../utils/Api/ApiError.js";
import { ApiResponse } from "../../../utils/Api/ApiResponse.js";
import { asyncHandler } from "../../utils/helpers/asyncHandler.js";

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

const editCommentController = asyncHandler(async (req, res) => {
  try {
    const commentId = req.params?.commentId; // optional (for replies)
    const userId = req.user?._id;
    const { content } = req.body;

    const editedComment = await editComment({
      userId,
      content,
      commentId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, editedComment, "Comment update successfully"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const myCommentController = asyncHandler(async (req, res) => {
  try {
    const userId = req?.user?._id;

    const allMyComments = await myComment({ userId });

    return res
      .status(200)
      .json(new ApiResponse(200, allMyComments, "All Your Comments List"));
  } catch (error) {
    console.error(error, "server is down");
    throw new ApiError(500, "Server is not responding");
  }
});

export {
  addCommentController,
  deleteCommentController,
  getCommentByVideoController,
  getReplyToCommentController,
  editCommentController,
  myCommentController,
};
