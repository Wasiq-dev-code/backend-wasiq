import { Subscription } from "../../models/Subscription.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

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
