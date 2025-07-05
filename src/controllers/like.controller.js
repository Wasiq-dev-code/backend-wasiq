import { likeAdded } from "../services/like/likeAdded.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateObjectId } from "../utils/validateObjectId.js";
const likeAddedController = asyncHandler(async (req, res, next) => {
  try {
    const videoID = req?.params?.videoId;
    const commentID = req?.params?.commentId;
    const UserID = req.user._id;

    if (!UserID) {
      throw new ApiError(500, "Unauthorized Request Please Login First");
    }

    validateObjectId(videoID, "Video ID");
    if (commentID) validateObjectId(commentID, "Comment ID");

    const likeDone = await likeAdded(videoID, commentID, UserID);

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

export { likeAddedController };
