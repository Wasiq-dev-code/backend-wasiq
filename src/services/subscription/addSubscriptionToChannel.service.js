import { Subscription } from "../../models/Subscription.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/validateObjectId.js";

export const addSubscriptionToChannel = async (userId, channelId) => {
  try {
    if (!userId) throw new ApiError("User ID is required");
    if (!channelId) throw new ApiError("Channel ID is required");

    if (userId) validateObjectId(userId, "User ID");
    if (channelId) validateObjectId(channelId, "Channel ID");

    const subscribed = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });

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
    return subscribed;
  } catch (error) {
    console.error("ApiError adding subscription:", error);
    throw new ApiError("Failed to add subscription");
  }
};
