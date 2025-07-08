import { commentLikeAdded } from "../services/like/commentLikeAdded.service.js";
import { commentLikeDelete } from "../services/like/commentLikeDelete.service.js";
import { isLikeByUser } from "../services/like/isLikedByUser.service.js";
import { videoLikeAdded } from "../services/like/videoLikeAdded.service.js";
import { videoLikeDelete } from "../services/like/videoLikeDelete.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateObjectId } from "../utils/validateObjectId.js";

const videoLikeAddedController = asyncHandler(async (req, res) => {
  try {
    const videoID = req?.params?.videoId;
    const UserID = req.user._id;

    if (!UserID) {
      throw new ApiError(500, "Unauthorized Request Please Login First");
    }

    validateObjectId(videoID, "Video ID");

    const likeDone = await videoLikeAdded(videoID, UserID);

    if (!likeDone) {
      throw new ApiError(400, "Like operation is failed");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likeDone, "Liked Successfully Done"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const commentLikeAddedController = asyncHandler(async (req, res) => {
  try {
    const commentID = req?.params?.commentId;
    const UserID = req?.user?._id;

    if (!UserID) {
      throw new ApiError(500, "Unauthorized Request Please Login First");
    }

    validateObjectId(commentID, "comment ID");

    const likeDone = await commentLikeAdded(commentID, UserID);

    if (!likeDone) {
      throw new ApiError(400, "Like operation is failed");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likeDone, "Liked Successfully Done"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const videoLikedeleteController = asyncHandler(async (req, res) => {
  try {
    const videoID = req?.params?.videoId;
    const UserID = req?.user?._id;

    if (!UserID) {
      throw new ApiError(500, "Unauthorized Request Please Login First");
    }

    validateObjectId(videoID, " video ID");

    await videoLikeDelete(videoID, UserID);

    return res.status(200).json(new ApiResponse(200, "videoLiked deleted"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const commentLikedeleteController = asyncHandler(async (req, res) => {
  try {
    const commentID = req?.params?.commentId;
    const UserID = req?.user?._id;

    if (!UserID) {
      throw new ApiError(500, "Unauthorized Request Please Login First");
    }

    validateObjectId(commentID, "comment ID");

    await commentLikeDelete(commentID, UserID);

    return res.status(200).json(new ApiResponse(200, "commentLiked deleted"));
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

const isLikedByUserController = asyncHandler(async (req, res) => {
  try {
    const { videoId, commentId } = req?.params;
    const userId = req?.user?._id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!videoId && !commentId) {
      throw new ApiError(401, "Error in params");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    const likePresented = await isLikeByUser(videoId, commentId, userId);

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

export {
  videoLikeAddedController,
  commentLikeAddedController,
  videoLikedeleteController,
  commentLikedeleteController,
};
