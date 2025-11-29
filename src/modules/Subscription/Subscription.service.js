import { Subscription } from "./Subscription.model.js";
import { ApiError } from "../../utils/Api/ApiError.js";

export const subscriptionToggle = async ({ userId, channelId }) => {
  if (!userId) throw new ApiError("User ID is required");
  if (!channelId) throw new ApiError("Channel ID is required");

  const query = {
    subscriber: userId,
    channel: channelId,
  };

  const already = await Subscription.findOne(query);

  if (already) {
    await Subscription.findByIdAndDelete(already._id);
    return { subscribed: false };
  }

  await Subscription.create(query);
  return { subscribed: true };
};

export const getSubscriberCount = async ({ channelId }) => {
  if (!channelId) throw new ApiError("Channel ID is required");

  return await Subscription.countDocuments({ channel: channelId });
};

export const channelSubscribeOthers = async ({ userId }) => {
  if (!userId) throw new ApiError("User ID is required");

  return await Subscription.countDocuments({ subscriber: userId });
};
