import { Video } from "../models/Video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyVideo = asyncHandler(async (req, _, next) => {
  try {
    const { videoId } = req.params;

    if (!videoId?.trim()) {
      throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (!video.owner) {
      throw new ApiError(400, "Video owner information missing");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(403, "Unauthorized: You don't own this video");
    }

    req.video = video;
    next();
  } catch (error) {
    console.error("Video Security Middleware Error:", error);

    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Internal server error"
    );
  }
});
