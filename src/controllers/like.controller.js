import { commentLikeAdded } from "../services/like/commentLikeAdded.service.js";
import { commentLikeDelete } from "../services/like/commentLikeDelete.service.js";
import { videoLikeAdded } from "../services/like/videoLikeAdded.service.js";
import { videoLikeDelete } from "../services/like/videoLikeDelete.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateObjectId } from "../utils/validateObjectId.js";

const videoLikeAdded = asyncHandler(async (req, res) => {
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

const commentLikeAdded = asyncHandler(async (req, res) => {
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

const videoLikedelete = asyncHandler(async (req, res) => {
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

const commentLikedelete = asyncHandler(async (req, res) => {
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

export { videoLikeAdded, commentLikeAdded, videoLikedelete, commentLikedelete };
