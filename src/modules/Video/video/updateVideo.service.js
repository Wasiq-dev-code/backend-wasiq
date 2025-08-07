import mongoose from "mongoose";
import { Video } from "../../models/Video.model.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary.js";
import filterObject from "../../utils/filterObject.js";

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
