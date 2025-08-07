import { Subscription } from "../../models/Subscription.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const addSubscriptionToChannel = async ({ userId, channelId }) => {
  try {
    if (!userId) throw new ApiError("User ID is required");
    if (!channelId) throw new ApiError("Channel ID is required");

    if (userId) validateObjectId(userId, "User ID");
    if (channelId) validateObjectId(channelId, "Channel ID");

    const subscribed = await Subscription.isSubscribed(userId, channelId);

    if (!subscribed) {
      const subscription = await Subscription.create({
        subscriber: userId,
        channel: channelId,
      });

      if (!subscription) {
        throw new ApiError("Subscription operation failed");
      }
      return subscription;
    }
    throw new ApiError(400, "Subscription already exists");
  } catch (error) {
    console.error("ApiError adding subscription:", error);
    throw new ApiError("Failed to add subscription");
  }
};

export const removeSubscriptionFromChannel = async ({ userId, channelId }) => {
  try {
    if (!userId) throw new ApiError("User ID is required");
    if (!channelId) throw new ApiError("Channel ID is required");

    // Validate Object IDs
    if (userId) validateObjectId(userId, "User ID");
    if (channelId) validateObjectId(channelId, "Channel ID");

    const isSubscribe = await Subscription.isSubscribed(userId, channelId);

    if (!isSubscribe) {
      throw new ApiError(400, "Subscription does not exists already");
    }

    const subscription = await Subscription.findOneAndDelete({
      subscriber: userId,
      channel: channelId,
    });

    if (!subscription) {
      throw new api("Subscription not found or already removed");
    }
    return true;
  } catch (error) {
    console.error("Error removing subscription:", error);
    throw new ApiError("Failed to remove subscription");
  }
};

export const channelSubscribeOthers = async ({ channelId }) => {
  try {
    if (!channelId) throw new ApiError("Channel ID is required");

    if (channelId) validateObjectId(channelId, "Channel ID");

    const count = await Subscription.countDocuments({ channel: channelId });

    if (!count) {
      console.log("havent subscribe yet");
      return 0;
    }

    return count;
  } catch (error) {
    console.error("Error getting subscriber count:", error);
    throw new ApiError("Failed to get subscriber count");
  }
};

export const checkSubscriptionStatus = async ({ userId, channelId }) => {
  try {
    if (!userId) throw new ApiError("User ID is required");
    if (!channelId) throw new ApiError("Channel ID is required");

    // Validate Object IDs
    if (userId) validateObjectId(userId, "User ID");
    if (channelId) validateObjectId(channelId, "Channel ID");

    // Check subscription status logic
    const subscription = await Subscription.isSubscribed(userId, channelId);

    return subscription; // Returns true if subscribed, false otherwise
  } catch (error) {
    console.error("Error checking subscription status:", error);
    throw new ApiError("Failed to check subscription status");
  }
};

export const subscriptionToggle = async ({ userId, channelId }) => {
  try {
    if (!userId) throw new ApiError("User ID is required");
    if (!channelId) throw new ApiError("Channel ID is required");

    // Validate Object IDs
    if (userId) validateObjectId(userId, "User ID");
    if (channelId) validateObjectId(channelId, "Channel ID");

    // Check if the user is already subscribed
    const existingSubscription = await Subscription.findOne(userId, channelId);

    !existingSubscription
      ? await Subscription.create({
          subscriber: userId,
          channel: channelId,
        })
      : await Subscription.deleteOne({
          subscriber: userId,
          channel: channelId,
        });

    return true;
  } catch (error) {
    console.error("Error toggling subscription:", error);
    throw new ApiError("Failed to toggle subscription");
  }
};

export const getSubscriberCount = async ({ userId }) => {
  try {
    if (!userId) throw new ApiError("User ID is required");

    if (userId) validateObjectId(userId, "User ID");

    const count = await Subscription.countDocuments({ subscriber: userId });

    if (!count) {
      console.log("havent subscribe yet");
      return 0;
    }
    return count;
  } catch (error) {
    console.error("Error getting subscriber count:", error);
    throw new ApiError("Failed to get subscriber count");
  }
};
