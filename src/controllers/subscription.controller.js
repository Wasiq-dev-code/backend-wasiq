import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { addSubscriptionToChannel } from "../services/subscription/addSubscriptionToChannel.service.js";
import { removeSubscriptionFromChannel } from "../services/subscription/removeSubscriptionFromChannel.service.js";
import {
  channelSubscribeOthers,
  getSubscriberCount,
} from "../services/subscription/getSubscriberCount.service.js";
import { checkSubscriptionStatus } from "../services/subscription/checkSubscriptionStatus.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { subscriptionToggle } from "../services/subscription/subscriptionToggle.service.js";

const addSubscriptionToChannelController = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized Request Please Login First");
    }

    if (!channelId) {
      throw new ApiError(400, "Channel ID is required");
    }

    if (channelId) validateObjectId(channelId, "Channel ID");
    if (userId) validateObjectId(userId, "User ID");

    const subscription = await addSubscriptionToChannel(userId, channelId);

    if (!subscription) {
      throw new ApiError(400, "Subscription operation failed");
    }

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

      if (!userId) {
        throw new ApiError(401, "Unauthorized Request Please Login First");
      }

      if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
      }

      if (channelId) validateObjectId(channelId, "Channel ID");
      if (userId) validateObjectId(userId, "User ID");

      try {
        await removeSubscriptionFromChannel(userId, channelId);
      } catch (error) {
        console.error("Error removing subscription:", error);
      }

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

    if (!channelId) {
      throw new ApiError(400, "Channel ID is required");
    }

    if (channelId) validateObjectId(channelId, "Channel ID");

    // Assuming you have a service to get subscriber count
    const count = await getSubscriberCount(channelId);

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

    if (!userId) {
      throw new ApiError(401, "Unauthorized Request Please Login First");
    }

    if (!channelId) {
      throw new ApiError(400, "Channel ID is required");
    }

    if (channelId) validateObjectId(channelId, "Channel ID");
    if (userId) validateObjectId(userId, "User ID");

    // Assuming you have a service to check subscription status
    const isSubscribed = await checkSubscriptionStatus(userId, channelId);

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

    if (!userId) {
      throw new ApiError(401, "Unauthorized Request Please Login First");
    }

    if (!channelId) {
      throw new ApiError(400, "Channel ID is required");
    }

    if (channelId) validateObjectId(channelId, "Channel ID");
    if (userId) validateObjectId(userId, "User ID");

    const isSubscribed = await subscriptionToggle(userId, channelId);
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

    if (!userId) {
      throw new ApiError(400, "Unauthorized request");
    }

    if (userId) validateObjectId(userId, " User ID");

    // Assuming you have a service to get subscriber count
    const count = await channelSubscribeOthers(userId);

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
