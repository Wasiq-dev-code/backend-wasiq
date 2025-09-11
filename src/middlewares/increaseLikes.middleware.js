import client from "../config/redis.js";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId.js";
import { redisAvailable } from "../utils/Cache/checkRedisConnection.js";
import { ApiResponse } from "../utils/Api/ApiResponse.js";

const trackVideoLikes = (prefix, duration) => {
  return async (req, _, next) => {
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

      if (!validateObjectId(videoId) && validateObjectId(!commentId)) {
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
          multi.set(redisKeyLikes);
          multi.set(videoLikesKey);
          multi.set(videoSyncLikes);
        } else {
          throw new ApiError(400, "Like already available");
        }
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              __,
              "Liked has been saved in redis and will save in solid database"
            )
          );
      }

      if (prefix === "delete") {
        if (alreadyLikes) {
          multi.del(redisKeyLikes);
          if (videoLikesKey.length > 0) multi.del(videoLikesKey);
          if (videoSyncLikes.length > 0) multi.del(videoSyncLikes);
        } else {
          throw new ApiError(400, "Like already deleted");
        }
        return res.status(200).json(new ApiResponse(200, __, "Liked deleted"));
      }

      const execResult = await multi.exec();

      if (!execResult) {
        throw new ApiError(409, "Like operation conflict, please retry");
      }
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

// if (!alreadyLikes) {
//   multi.set(redisKeyLikes);
//   multi.set(videoLikesKey);
//   multi.set(videoSyncLikes);
// } else {
//   multi.del(redisKeyLikes);

//   // const [videoLikeCountRaw, syncLikeCountRaw] = await Promise.all([
//   //   client.get(videoLikesKey),
//   //   client.get(videoSyncLikes),
//   // ]);

//   // const videoLikeCount = parseInt(videoLikeCountRaw) || 0;

//   // const syncLikeCount = parseInt(syncLikeCountRaw) || 0;

//   if (videoLikesKey.length > 0) multi.del(videoLikesKey);
//   if (videoSyncLikes.length > 0) multi.del(videoSyncLikes);
// }
