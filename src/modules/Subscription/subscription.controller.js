import { asyncHandler } from "../../utils/helpers/asyncHandler.js";
import { ApiResponse } from "../../utils/Api/ApiResponse.js";
import {
  channelSubscribeOthers,
  getSubscriberCount,
  subscriptionToggle,
} from "./Subscription.service.js";

const subscriberCountController = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const count = await getSubscriberCount({ channelId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        count,
        count === 0
          ? "had no subscriber yet"
          : "Subscriber count retrieved successfully"
      )
    );
});

const subscriptionToggleController = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const result = await subscriptionToggle({ userId, channelId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.subscribed
          ? "User subscribed successfully"
          : "User unsubscribed successfully"
      )
    );
});

const channelSubscribeOthersController = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  const count = await channelSubscribeOthers({ userId });

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
});

export {
  subscriberCountController,
  subscriptionToggleController,
  channelSubscribeOthersController,
};
