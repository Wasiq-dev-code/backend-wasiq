import { Subscription } from "../../models/Subscription.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

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
