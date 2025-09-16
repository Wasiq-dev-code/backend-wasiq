import mongoose from "mongoose";
import { Video } from "./Video.model.js";
import { ApiError } from "../../utils/Api/ApiError.js";
import {
  uploadOnCloudinary,
  deleteOnCloudinary,
} from "../../utils/helpers/cloudinary.js";
import filterObject from "../../utils/helpers/filterObject.js";

export const videoUploader = async ({ user, files, title, description }) => {
  try {
    if (!title?.trim() || !description?.trim()) {
      throw new ApiError(400, "Title and description are required");
    }

    const userId = user?._id;

    if (!userId) {
      throw new ApiError("user unauthorized");
    }

    const videoLocalPath = files?.videoFile[0]?.path;
    const thumbnailLocalPath = files?.thumbnail[0]?.path;

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

    // console.log(videoOnCloudinary);

    if (!videoOnCloudinary?.url || !thumbnailOnCloudinary?.url) {
      console.error("Cloudinary upload failed", {
        video: videoOnCloudinary,
        thumbnail: thumbnailOnCloudinary,
      });
      throw new ApiError(500, "Failed to upload files to Cloudinary");
    }

    if (!videoOnCloudinary.etag || !thumbnailOnCloudinary.etag) {
      throw new ApiError(500, "Failed to upload files to Cloudinary");
    }

    const existedFiles = await Video.findOne({
      $or: [
        { videoFile_etag: videoOnCloudinary.etag },
        { thumbnail_etag: thumbnailOnCloudinary.etag },
      ],
    });

    if (existedFiles) {
      throw new ApiError(
        400,
        "This video or thumbnail has already been uploaded"
      );
    }

    const video = await Video.create({
      title,
      description,
      videoFile: videoOnCloudinary.url,
      videoFile_publicId: videoOnCloudinary.public_id,
      videoFile_etag: videoOnCloudinary.etag,
      thumbnail: thumbnailOnCloudinary.url,
      thumbnail_publicId: thumbnailOnCloudinary.public_id,
      thumbnail_etag: thumbnailOnCloudinary.etag,
      duration: videoOnCloudinary?.duration || 0,
      owner: userId,
    });

    if (!video) {
      throw new ApiError(500, "database issue");
    }

    const videoObj = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(video._id),
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
          createdAt: {
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
        },
      },
    ]);

    if (videoObj?.length === 0) {
      throw new ApiError(404, "video not found");
    }

    return videoObj[0];
  } catch (error) {
    console.error(
      "Occuring error while uploading video",
      error?.stack || error
    );
    if (error.code === 11000) {
      if (error.keyPattern?.videoFile_etag) {
        throw new ApiError(400, "This video has already been uploaded");
      }
      if (error.keyPattern?.thumbnail_etag) {
        throw new ApiError(400, "This thumbnail has already been uploaded");
      }
    }
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Server is down"
    );
  }
};

export const getAllVideos = async ({ page, limit }) => {
  try {
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

    if (!videos) {
      throw new ApiError(500, "videos not found");
    }

    return videos;
  } catch (error) {
    console.error("getAllVideos erroring", error?.stack || error);

    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Error while fetching Videos"
    );
  }
};

export const getVideoById = async ({ videoId }) => {
  try {
    if (!videoId?.trim()) {
      throw new ApiError(500, "videoId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid videoId format");
    }

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

    return video[0];
  } catch (error) {
    console.error("Error at getVideoById", error?.stack || error);
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Error while implementing controller"
    );
  }
};

export const deleteVideo = async ({ video }) => {
  try {
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

    return true;
  } catch (error) {
    console.error("Error on deleteVideo", {
      video: video,
      error: error?.stack || error,
    });

    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Failed to deleteVideo"
    );
  }
};

export const updateVideo = async ({ body, file, video }) => {
  try {
    const allowedFields = ["title", "description"];
    const updateData = filterObject(body, allowedFields);

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, "Nothing to change");
    }

    const thumbnailpublicId = video?.thumbnail_publicId;

    if (!thumbnailpublicId) {
      throw new ApiError(400, "thumbnail public id cant get");
    }

    let updateThumbnail = {};

    if (file) {
      const thumbnailLocalPath = file?.path;

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
        thumbnail: thumbnailUploadedOnCloudinary?.url,
        thumbnail_publicId: thumbnailUploadedOnCloudinary?.public_id,
      };
    }

    const updateVideo = await Video.findByIdAndUpdate(
      video?._id,
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
    return completedUpdatedVideo[0];
  } catch (error) {
    console.error("Issue while operating service", {
      error: error?.stack || error,
    });
  }
};
