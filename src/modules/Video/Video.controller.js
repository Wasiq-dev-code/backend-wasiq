import { asyncHandler } from "../../utils/helpers/asyncHandler.js";
import { ApiError } from "../../utils/Api/ApiError.js";
import { ApiResponse } from "../../utils/Api/ApiResponse.js";

import {
  updateVideo,
  deleteVideo,
  getVideoById,
  getAllVideos,
  videoUploader,
} from "./Video.service.js";

import {
  clearVideoCache,
  clearVideoListCache,
} from "../../utils/Cache/redisChachingKeyStructure.js";

const videoUploaderController = asyncHandler(async (req, res) => {
  try {
    const { user, files } = req;
    const { title, description } = req?.body;

    const videoObj = await videoUploader({
      user,
      files,
      title,
      description,
    });

    try {
      await clearVideoListCache();
    } catch (error) {
      console.error(
        "Error while caching videolist in uploadingVideoController",
        error?.stack || error
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, videoObj, "Video uploaded successfully"));
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

const getAllVideosController = asyncHandler(async (req, res) => {
  try {
    // console.log("giving response directly throw mongoose");
    const page = Math.max(1, parseInt(req.query.page || 1));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || 10)));

    const videos = await getAllVideos({
      page,
      limit,
    });

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

const getVideoByIdController = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const getVideo = await getVideoById({
      videoId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, getVideo, "video successfully fetched"));
  } catch (error) {
    console.error("Error at getVideoById", error?.stack || error);
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Error while implementing controller"
    );
  }
});

const deleteVideoController = asyncHandler(async (req, res) => {
  try {
    const { video } = req;

    await Promise.all([
      deleteVideo({ video }),
      clearVideoCache(video?._id),
      clearVideoListCache(),
    ]);

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

const updateVideoController = asyncHandler(async (req, res) => {
  try {
    const { body, file, video } = req;

    const updatedVideo = await updateVideo({
      body,
      file,
      video,
    });

    await Promise.all([
      clearVideoCache(updatedVideo?._id),
      clearVideoListCache(),
    ]).catch((Error) => {
      throw new ApiError(500, "Error while chaching data");
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedVideo, "Successfully updated"));
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

export {
  videoUploaderController,
  getAllVideosController,
  getVideoByIdController,
  deleteVideoController,
  updateVideoController,
};
