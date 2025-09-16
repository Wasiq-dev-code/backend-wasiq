import { asyncHandler } from "../../utils/helpers/asyncHandler.js";
import { ApiError } from "../../../utils/Api/ApiError.js";
import { ApiResponse } from "../../../utils/Api/ApiResponse.js";
import {
  addSubscriptionToChannel,
  removeSubscriptionFromChannel,
  channelSubscribeOthers,
  getSubscriberCount,
  checkSubscriptionStatus,
  subscriptionToggle,
} from "./Subscription.service.js";

const addSubscriptionToChannelController = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const subscription = await addSubscriptionToChannel({ userId, channelId });

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscription, "Subscription added successfully")
      );
  } catch (error) {
    console.error(error.message || "Server is not responding");
    throw new ApiError(500, "Server is not responding");
  }
});

const removeSubscriptionFromChannelController = asyncHandler(
  async (req, res) => {
    try {
      const { channelId } = req.params;
      const userId = req.user._id;

      await removeSubscriptionFromChannel({ userId, channelId });

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Subscription removed successfully"));
    } catch (error) {
      console.error(error.message || "Server is not responding");
      throw new ApiError(500, "Server is not responding");
    }
  }
);

const subscriberCountController = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;

    const count = await getSubscriberCount({ channelId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          count,
          !count === 0
            ? "Subscriber count retrieved successfully"
            : "had no subscriber yet"
        )
      );
  } catch (error) {
    console.error(error.message || "Server is not responding");
    throw new ApiError(500, "Server is not responding");
  }
});

const checkSubscriptionStatusController = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    // Assuming you have a service to check subscription status
    const isSubscribed = await checkSubscriptionStatus({ userId, channelId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          isSubscribed,
          "Subscription status retrieved successfully"
        )
      );
  } catch (error) {
    console.error(error.message || "Server is not responding");
    throw new ApiError(500, "Server is not responding");
  }
});

const subscriptionToggleController = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const isSubscribed = await subscriptionToggle({ userId, channelId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          isSubscribed,
          "Subscription toggle status retrieved successfully"
        )
      );
  } catch (error) {
    console.error(error.message || "Server is not responding");
    throw new ApiError(500, "Server is not responding");
  }
});

const channelSubscribeOthersController = asyncHandler(async (req, res) => {
  try {
    const userId = req?.user?._id;

    // Assuming you have a service to get subscriber count
    const count = await channelSubscribeOthers({ userId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          count,
          !count == 0
            ? "SubscriberTo count retrieved successfully"
            : "havent subscribe yet"
        )
      );
  } catch (error) {
    console.error(error.message || "Server is not responding");
    throw new ApiError(500, "Server is not responding");
  }
});

export {
  addSubscriptionToChannelController,
  removeSubscriptionFromChannelController,
  subscriberCountController,
  checkSubscriptionStatusController,
  subscriptionToggleController,
  channelSubscribeOthersController,
};
