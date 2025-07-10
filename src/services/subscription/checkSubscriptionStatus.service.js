import { Subscription } from "../../models/Subscription.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

export const checkSubscriptionStatus = async (userId, channelId) => {
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
