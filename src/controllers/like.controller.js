import { isLikeByUser } from "../services/like/isLikedByUser.service.js";
import { toggleLike } from "../services/like/toggleLike.service.js";
import { totalCommentLikes } from "../services/like/totalCommentLikes.service.js";
import { totalVideoLikes } from "../services/like/totalVideoLikes.service.js";
import { videoLikeAdded } from "../services/like/videoLikeAdded.service.js";
import { videoLikeDelete } from "../services/like/videoLikeDelete.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const likeAddedController = asyncHandler(async (req, res) => {
  try {
    const { videoId, commentId } = req?.params;

    const userId = req.user._id;

    const likeDone = await videoLikeAdded({ videoId, userId, commentId });

    return res
      .status(200)
      .json(new ApiResponse(200, likeDone, "Liked Successfully Done"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const likedeleteController = asyncHandler(async (req, res) => {
  try {
    const { videoId, commentId } = req?.params;
    const userId = req?.user?._id;

    await videoLikeDelete({ userId, videoId, commentId });

    return res.status(200).json(new ApiResponse(200, "videoLiked deleted"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const isLikedByUserController = asyncHandler(async (req, res) => {
  try {
    const { videoId, commentId } = req?.params;
    const userId = req?.user?._id;

    const likePresented = await isLikeByUser({ videoId, commentId, userId });

    return res
      .status(200)
      .json(
        new ApiResponse(200, likePresented, likePresented ? "liked" : "no like")
      );
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const totalCommentLikesController = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req?.params;

    const commentLikes = await totalCommentLikes({ commentId });

    return res
      .status(200)
      .json(new ApiResponse(200, commentLikes, "Total Comment Likes"));
  } catch (error) {
    console.error(error.message || "Error in totalCommentLikesController");
    throw new ApiError(500, "Server error while counting comment likes");
  }
});

const totalVideoLikesController = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req?.params;

    const videoLikes = await totalVideoLikes({ videoId });

    return res
      .status(200)
      .json(new ApiResponse(200, videoLikes, "Total Video Likes"));
  } catch (error) {
    console.error(error.message || "Error in totalVideoLikesController");
    throw new ApiError(500, "Server error while counting Video likes");
  }
});

const toggleLikeContoller = asyncHandler(async (req, res) => {
  const { videoId, commentId } = req?.params;
  const userId = req?.user?._id;

  const toggleLikes = await toggleLike({ videoId, commentId, userId });

  return res
    .status(200)
    .json(new ApiResponse(200, toggleLikes, "operation successfull"));
});

export {
  likeAddedController,
  likedeleteController,
  isLikedByUserController,
  totalCommentLikesController,
  totalVideoLikesController,
  toggleLikeContoller,
};
