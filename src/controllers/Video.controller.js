import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/Video.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import trackVideoView from "../services/trackVideoView.js";
import filterObject from "../utils/filterObject.js";

const videoUploader = asyncHandler(async (req, res) => {
  try {
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

    const [videoOnCloudinary, thumbnailOnCloudinary] = await Promise.all([
      uploadOnCloudinary(videoLocalPath),
      uploadOnCloudinary(thumbnailLocalPath),
    ]).catch((error) => {
      console.error("uploading issue on cloudinary", error);
      throw new ApiError(500, "issue in cloudinary while uploading files");
    });

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

    const videoObj = await Video.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(video._id),
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
                _id: 1,
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: {
            $first: "$owner",
            $dateToString: {
              createdAt: {
                format: "%Y-%m-%d %H:%M",
                date: "$createdAt",
              },
            },
          },
        },
      },
      {
        $project: {
          videoFile_publicId: 0,
          thumbnail_publicId: 0,
        },
      },
    ]);

    if (videoObj?.length === 0) {
      throw new ApiError(404, "video not found");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, videoObj[0], "Video uploaded successfully"));
  } catch (error) {
    console.error(
      "Occuring error while uploading video",
      error?.stack || error
    );
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Server is down"
    );
  }
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

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId?.trim()) {
      throw new ApiError(500, "videoId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid videoId format");
    }

    await trackVideoView(videoId, req.ip);

    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
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
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "subscriptions",
          localField: "owner._id",
          foreignField: "channel",
          as: "totalSubscribers",
        },
      },

      {
        $addFields: {
          owner: { $first: "$owner" },
          totalSubscribers: {
            $size: "$totalSubscribers",
          },
          uploadedAt: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$createdAt",
            },
          },
        },
      },

      {
        $project: {
          videoFile_publicId: 0,
          thumbnail_publicId: 0,
          subscriber: 0,
        },
      },
    ]);

    if (!video?.[0]) {
      throw new ApiError("Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video[0], "video successfully fetched"));
  } catch (error) {
    console.error("Error at getVideoById", error?.stack || error);
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Error while implementing controller"
    );
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const video = req.video;

    if (!video?.videoFile_publicId || !video?.thumbnail_publicId) {
      throw new ApiError(404, "Invalid video data");
    }

    try {
      await Promise.all([
        deleteOnCloudinary(video.videoFile_publicId),
        deleteOnCloudinary(video.thumbnail_publicId),
      ]);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error", cloudinaryError);
      throw new ApiError(500, "Error while deleting media files");
    }

    const deletedVideo = await Video.findByIdAndDelete(video?._id);

    if (!deletedVideo) {
      throw new ApiError(500, "Error while deleting video on Database");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Sucessful to delete the video"));
  } catch (error) {
    console.error("Error on deleteVideo", {
      video: req.video,
      error: error?.stack || error,
    });
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Failed to deleteVideo"
    );
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  try {
    const allowedFields = ["title", "description"];
    const updateData = filterObject(req?.body, allowedFields);

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, "Nothing to change");
    }

    const thumbnailpublicId = req?.video?.thumbnail_publicId;

    if (!thumbnailpublicId) {
      throw new ApiError(400, "thumbnail public id cant get");
    }

    let updateThumbnail = {};

    if (req.file) {
      const thumbnailLocalPath = req.file?.path;

      if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail not found");
      }

      const thumbnailUploadedOnCloudinary =
        await uploadOnCloudinary(thumbnailLocalPath);

      if (
        !thumbnailUploadedOnCloudinary.url ||
        !thumbnailUploadedOnCloudinary.public_id
      ) {
        throw new ApiError(500, "cloudinary issue");
      }

      await deleteOnCloudinary(thumbnailpublicId).catch((error) => {
        throw new ApiError(
          error?.statusCode || 500,
          error?.message || "Error while deleting file on cloudinary"
        );
      });

      updateThumbnail = {
        thumbnail: thumbnailUploadedOnCloudinary.url,
        thumbnail_publicId: thumbnailUploadedOnCloudinary.public_id,
      };
    }

    const updateVideo = await Video.findByIdAndUpdate(
      req?.video?._id,
      {
        $set: {
          ...updateData,
          ...updateThumbnail,
        },
      },
      {
        new: true,
      }
    );

    if (!updateVideo) {
      throw new ApiError(404, "Database issue");
    }

    const completedUpdatedVideo = Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(updateVideo?._id),
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
                _id: 1,
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          updatedAt: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$updatedAt",
            },
          },
        },
      },

      {
        $project: {
          videoFile_publicId: 0,
          thumbnail_publicId: 0,
        },
      },
    ]);

    if (!completedUpdatedVideo?.[0]) {
      throw new ApiError(404, "video not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, completedUpdatedVideo[0], "Successfully updated")
      );
  } catch (error) {
    console.error("Error on updateVideo", {
      body: req.body,
      error: error?.stack || error,
    });
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Error while executing updateVideo Controller"
    );
  }
});

export { videoUploader, getAllVideos, getVideoById, deleteVideo, updateVideo };
