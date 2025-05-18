import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { Video } from "../../models/Video.model.js";
import trackVideoView from "./helper/trackVideoView.service.js";

export const getVideoById = async ({ videoId, ip }) => {
  try {
    if (!videoId?.trim()) {
      throw new ApiError(500, "videoId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid videoId format");
    }

    await trackVideoView(videoId, ip);

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
