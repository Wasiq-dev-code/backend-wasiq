import mongoose from "mongoose";
import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const getUserHistory = async ({ user }) => {
  try {
    if (!user) {
      throw new ApiError(400, "Unauthorized REQ");
    }

    const userHistory = await User.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullname: 1,
                      username: 1,
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
              },
            },
          ],
        },
      },
    ]);

    if (!userHistory) {
      throw new ApiError(404, "User history is empty");
    }

    return userHistory;
  } catch (error) {
    console.error(
      "Error while executing getUserHistory method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to getUserHistory method");
  }
};
