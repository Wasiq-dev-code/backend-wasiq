import client from "../config/redis.js";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId.js";
import { redisAvailable } from "../utils/Cache/checkRedisConnection.js";
import { ApiResponse } from "../utils/Api/ApiResponse.js";

const trackVideoLikes = (prefix, duration) => {
  return async (req, res, next) => {
    if (!redisAvailable) {
      console.log("⚠ Redis DOWN → fallback to MongoDB");
      next();
    }

    if (req.method !== "GET") return next();

    try {
      const { _id } = req?.user;
      const { videoId } = req?.params;
      const { commentId } = req?.params;

      if (!validateObjectId(_id)) {
        throw new ApiError(400, "Unauthorized Req");
      }

      if (!validateObjectId(videoId) && !validateObjectId(!commentId)) {
        throw new Error("Either videoId or commentId must be provided");
      }

      const redisKeyLikes = `Likes:${_id}:${videoId || commentId}`;

      const videoLikesKey = `video:${_id}:Likes`;

      const videoSyncLikes = `syncLikes:${_id}:${videoId}:${commentId}`;

      await client.watch(redisKeyLikes);

      const alreadyLikes = await client.exists(redisKeyLikes);

      const multi = client.multi();

      if (prefix === "Add") {
        if (!alreadyLikes) {
          multi.set(redisKeyLikes, 1);
          multi.set(videoLikesKey, 1);
          multi.set(videoSyncLikes, 1);
        } else {
          throw new ApiError(400, "Like already available");
        }
      }

      if (prefix === "delete") {
        if (alreadyLikes) {
          multi.del(redisKeyLikes);
          multi.del(videoLikesKey);
          multi.del(videoSyncLikes);
        } else {
          throw new ApiError(400, "Like already deleted");
        }
      }

      const execResult = await multi.exec();

      if (!execResult) {
        throw new ApiError(409, "Like operation conflict, please retry");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Redis like operation successful"));
    } catch (error) {
      console.error("Error while tracking the Likes", {
        error: error?.message || error,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, "Unsucessfull to execute trackVideoLikes");
    }
  };
};

export default trackVideoLikes;
