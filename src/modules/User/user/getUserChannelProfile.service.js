export const getUserChannelProfile = async ({ username }) => {
  try {
    if (!username.trim()) {
      throw new ApiError(400, "username should be pass through URL");
    }

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id", //must read about
          foreignField: "channel",
          as: "Totalsubscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "SubscribeTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$Totalsubscribers",
          },
          subscribeToCount: {
            $size: "$SubscribeTo",
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$Totalsubscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          fullname: 1,
          coverImg: 1,
          avatar: 1,
          subscribersCount: 1,
          subscribeToCount: 1,
          isSubscribed: 1,
        },
      },
    ]);

    if (!channel.length) {
      throw new ApiError(400, "channel is not provided");
    }

    return channel;
  } catch (error) {
    console.error(
      "Error while executing getUserChannelProfile method",
      error?.stack || error
    );
    throw new ApiError(
      500,
      "Server is down due to getUserChannelProfile method"
    );
  }
};
