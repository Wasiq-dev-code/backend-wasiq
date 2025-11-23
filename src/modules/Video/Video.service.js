import mongoose, { Mongoose } from "mongoose";
import { Video } from "./Video.model.js";
import { ApiError } from "../../utils/Api/ApiError.js";
import {
  uploadOnCloudinary,
  deleteOnCloudinary,
} from "../../utils/helpers/cloudinary.js";
import filterObject from "../../utils/helpers/filterObject.js";

// Public Routes
export const getAllVideos = async ({ page, limit }) => {
  if (!page || !limit) {
    throw new ApiError(400, "Page and Limit are required in query");
  }

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
};

export const getVideoById = async ({ videoId }) => {
  try {
    if (!videoId?.trim()) {
      throw new ApiError(500, "videoId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid videoId format");
    }

    await Video.updateOne({ _id: videoId }, { $inc: { views: 1 } });

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
        $addFields: {
          owner: { $first: "$owner" },
        },
      },

      {
        $lookup: {
          from: "subscriptions",
          let: { ownerId: "$owner._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$channel", "$$ownerId"] } } },
            { $count: "count" },
          ],
          as: "owner.totalSubscribers",
        },
      },

      // LIKES
      {
        $lookup: {
          from: "likes",
          let: { fetchVideoId: "$_Id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$video", "$$fetchVideoId"] } } },
            {
              $count: "count",
            },
          ],
          as: "likes",
        },
      },

      {
        $addFields: {
          "owner.totalSubscribers": {
            $ifNull: [{ $first: "$owner.totalSubscribers.count" }, 0],
          },

          likes: {
            $ifNull: [{ $first: "$Likes.count" }, 0],
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

// Authorized Routes
export const videoUploader = async ({ userId, files, title, description }) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized Req");
  }

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
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
    throw new ApiError(500, "Failed to upload files on Cloudinary");
  }

  // if (!videoOnCloudinary.etag || !thumbnailOnCloudinary.etag) {
  //   throw new ApiError(500, "Failed to upload files on Cloudinary");
  // }

  // const existedFiles = await Video.findOne({
  //   $and: [
  //     { videoFile_etag: videoOnCloudinary.etag },
  //     { thumbnail_etag: thumbnailOnCloudinary.etag },
  //   ],
  // });

  // if (existedFiles) {
  //   try {
  //     await cloudinary.uploader.destroy(videoOnCloudinary.public_id);
  //     await cloudinary.uploader.destroy(thumbnailOnCloudinary.public_id);
  //   } catch (error) {
  //     throw new ApiError(
  //       400,
  //       "These files are already been uploaded by someone"
  //     );
  //   }
  // }

  const video = await Video.create({
    title,
    description,
    videoFile: videoOnCloudinary.url,
    videoFile_publicId: videoOnCloudinary.public_id,
    // videoFile_etag: videoOnCloudinary.etag,
    thumbnail: thumbnailOnCloudinary.url,
    thumbnail_publicId: thumbnailOnCloudinary.public_id,
    // thumbnail_etag: thumbnailOnCloudinary.etag,
    duration: videoOnCloudinary?.duration || 0,
    owner: userId,
  });

  if (!video) {
    throw new ApiError(500, "Video not found, database issue");
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
        __v: 0,
      },
    },
  ]);

  if (videoObj?.length === 0) {
    throw new ApiError(404, "video not found");
  }

  return videoObj[0];
};

export const deleteVideo = async ({ video }) => {
  // console.log(video);
  if (!video?.videoFile_publicId || !video?.thumbnail_publicId) {
    throw new ApiError(401, "Invalid video data");
  }

  console.log(
    "Video public Id ",
    video.videoFile_publicId,
    "thumbnail public Id",
    video.thumbnail_publicId
  );

  await deleteOnCloudinary(video.videoFile_publicId, "video");
  await deleteOnCloudinary(video.thumbnail_publicId, "image");

  const deletedVideo = await Video.findByIdAndDelete(video?._id);

  if (!deletedVideo) {
    throw new ApiError(500, "Error while deleting video in Database");
  }

  return true;
};

export const updateVideo = async ({ body, file, video }) => {
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

    await deleteOnCloudinary(thumbnailpublicId, "image").catch((error) => {
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
    throw new ApiError(500, "Database issue");
  }

  // console.log(updateVideo);

  const completedUpdatedVideo = await Video.aggregate([
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

  // console.log(completedUpdatedVideo);

  if (!completedUpdatedVideo?.[0]) {
    throw new ApiError(500, "video not found, DB issue");
  }
  return completedUpdatedVideo[0];
};

export const getAllMyVideos = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(400, "VideoId and userId are required");
  }

  const allMyVideos = await Video.find({
    owner: userId,
  }).select("-isPublished -owner -thumbnail_publicId -videoFile_publicId");

  if (!allMyVideos) {
    throw new ApiError(500, "Could'nt have find videos, Db Issue");
  }

  return allMyVideos;
};
