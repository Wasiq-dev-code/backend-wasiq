import {
  addComment,
  deleteComment,
  getCommentsOfVideo,
} from "./Comment.service.js";
import { ApiResponse } from "../../utils/Api/ApiResponse.js";
import { asyncHandler } from "../../utils/helpers/asyncHandler.js";

const addCommentController = asyncHandler(async (req, res) => {
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
});

const deleteCommentController = asyncHandler(async (req, res) => {
  const commentId = req.params?.commentId; // optional (for replies)
  const userId = req.user?._id;

  await deleteComment({
    userId,
    commentId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Comment deleted successfully"));
});

const getCommentsOfVideoController = asyncHandler(async (req, res) => {
  const videoId = req.params?.videoId;

  const comments = await getCommentsOfVideo({
    videoId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comments, "all comments and replies of video"));
});

export {
  addCommentController,
  deleteCommentController,
  getCommentsOfVideoController,
};
