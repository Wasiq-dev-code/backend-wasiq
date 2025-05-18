import { Video } from "../../models/Video.model";
import { ApiError } from "../../utils/ApiError";

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
