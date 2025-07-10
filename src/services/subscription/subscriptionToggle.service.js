import { Subscription } from "../../models/Subscription.model";
import { ApiError } from "../../utils/ApiError";

export const subscriptionToggle = async (userId, channelId) => {
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
