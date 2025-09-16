import client from "../config/redis.js";
import { ApiError } from "../utils/Api/ApiError.js";
import { validateObjectId } from "../utils/helpers/validateObjectId.js";
import { redisAvailable } from "../utils/Cache/checkRedisConnection.js";
import { ApiResponse } from "../utils/Api/ApiResponse.js";

const trackSubscribers = (prefix, duration) => {
  return async (req, res, next) => {
    if (!redisAvailable) {
      console.log("⚠ Redis DOWN → fallback to MongoDB");
      next();
    }

    if (req.method !== "GET") return next();

    try {
      const { _id } = req?.user;
      const { channelId } = req?.params;

      if (!validateObjectId(_id)) {
        throw new ApiError(400, "Unauthorized Req");
      }

      if (!validateObjectId(channelId)) {
        throw new Error("Either videoId or channelId must be provided");
      }

      const redisKeySubscriber = `Subscriber:${_id}:${channelId}`;

      const subscriberKey = `Channel:${_id}:Subscriber`;

      const subscriberSyncKey = `syncSubscriber:${_id}:${channelId}`;

      await client.watch(redisKeySubscriber);

      const alreadySubscribe = await client.exists(redisKeySubscriber);

      const multi = client.multi();

      if (prefix === "Add") {
        if (!alreadySubscribe) {
          multi.set(redisKeySubscriber, 1);
          multi.set(subscriberKey, 1);
          multi.set(subscriberSyncKey, 1);
        } else {
          throw new ApiError(400, "Already Subscribed");
        }
      }

      if (prefix === "delete") {
        if (alreadySubscribe) {
          multi.del(redisKeySubscriber);
          multi.del(subscriberKey);
          multi.del(subscriberSyncKey);
        } else {
          throw new ApiError(400, "Already Unsubscribed");
        }
      }

      const execResult = await multi.exec();

      if (!execResult) {
        throw new ApiError(409, "Subscriber operation conflict, please retry");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, {}, "Redis subscription operation successful")
        );
    } catch (error) {
      console.error("Error while tracking the subscriber", {
        error: error?.message || error,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, "Unsucessful to execute trackSubscribers");
    }
  };
};

export default trackSubscribers;
