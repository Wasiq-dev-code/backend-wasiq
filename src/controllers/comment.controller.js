import { addComment } from "../services/comment/addComment.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateObjectId } from "../utils/validateObjectId.js";

const addCommentController = asyncHandler(async (req, res) => {
  try {
    const videoID = req?.params?.videoId;
    const commentID = req?.params?.commentId;
    const userID = req?.user?._id;
    const { content } = req?.body;

    if (!userID) {
      throw new ApiError(400, "Unauthorized request");
    }

    if (!content.trim()) {
      throw new ApiError("content does not trim");
    }

    if (!videoID) {
      throw new ApiError(400, "Video id does not found in the params");
    }

    validateObjectId(videoID, "Video ID");
    validateObjectId(userID, "user ID");

    const properties = {
      videoID,
      userID,
      content,
    };

    if (commentID) {
      validateObjectId(commentID, "comment ID");
      properties.commentID = commentID;
    }

    const commented = await addComment(properties);

    return res
      .status(200)
      .json(
        new ApiResponse(200, commented, "Comment insert operation is done")
      );
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
});

export { addCommentController };
