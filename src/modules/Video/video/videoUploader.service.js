import mongoose from "mongoose";
import { Video } from "../../models/Video.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

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
