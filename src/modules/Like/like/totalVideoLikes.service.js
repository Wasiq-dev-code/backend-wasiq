import { Like } from "../../models/Likes.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const totalVideoLikes = async ({ videoId }) => {
  try {
    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }

    validateObjectId(videoId, "Video ID");

    const likeCount = await Like.countDocuments({ video: videoId });

    return likeCount;
  } catch (error) {
    console.error(error.message || "Error in totalVideoLikes");
    throw new ApiError(500, "Server error while counting Video likes");
  }
};
