import { Subscription } from "../../models/Subscription.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

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
