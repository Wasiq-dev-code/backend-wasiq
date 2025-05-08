import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/Video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const videoUploader = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError("user unauthorized");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail files are required");
  }

  const videoOnCloudinary = await uploadOnCloudinary(videoLocalPath);
  const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoOnCloudinary?.url || !thumbnailOnCloudinary?.url) {
    console.error("Cloudinary upload failed", {
      video: videoOnCloudinary,
      thumbnail: thumbnailOnCloudinary,
    });
    throw new ApiError(500, "Failed to upload files to Cloudinary");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoOnCloudinary.url,
    videoFile_publicId: videoOnCloudinary.public_id,
    thumbnail: thumbnailOnCloudinary.url,
    thumbnail_publicId: thumbnailOnCloudinary.public_id,
    duration: videoOnCloudinary?.duration || 0,
    owner: userId,
  });

  if (!video) {
    throw new ApiError(500, "database issue");
  }

  const createdVideo = await Video.findById(video._id).select(
    "-videoFile_publicId -thumbnail_publicId"
  );

  if (!createdVideo) {
    throw new ApiError(500, "database issue");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"));
});

export { videoUploader };
