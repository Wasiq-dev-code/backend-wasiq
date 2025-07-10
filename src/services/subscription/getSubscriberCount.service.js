import { Subscription } from "../../models/Subscription.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

export const getSubscriberCount = async (channelId) => {
  try {
    if (!channelId) throw new ApiError("Channel ID is required");

    if (channelId) validateObjectId(channelId, "Channel ID");

    const count = await Subscription.countDocuments({ channel: channelId });
    return count;
  } catch (error) {
    console.error("Error getting subscriber count:", error);
    throw new ApiError("Failed to get subscriber count");
  }
};
