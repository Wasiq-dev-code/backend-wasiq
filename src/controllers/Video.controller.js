import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/Video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";

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

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || 1));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || 10)));

    const pipeline = [
      {
        $match: { isPublished: true },
      },
      {
        $project: {
          videoFile_publicId: 0,
          thumbnail_publicId: 0,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                avatar: 1,
                username: 1,
                _id: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: { $first: "$owner" },
          totalViews: { $ifNull: ["$views", 0] },
          uploadedAt: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$createdAt",
            },
          },
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), {
      page,
      limit,
      customLabels: {
        docs: "videos",
        totalDocs: "totalVideos",
      },
      lean: true,
      // cache: true,
    });

    if (!videos?.videos?.length) {
      return res.status(200).json(new ApiResponse(200, [], "No videos found"));
    }

    const response = {
      videos: videos.videos,
      totalVideos: videos.totalVideos,
      currentPage: videos.page,
      totalPages: videos.totalPages,
      hasNextPage: videos.hasNextPage,
      hasPrevPage: videos.hasPrevPage,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Successfully fetching all the videos")
      );
  } catch (error) {
    console.error("getAllVideos erroring", error?.stack || error);

    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Error while fetching Videos"
    );
  }
});

export { videoUploader, getAllVideos };
