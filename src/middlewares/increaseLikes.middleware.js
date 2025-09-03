import client from "../config/redis.js";
import { TTL } from "../constants.js";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId.js";

const trackVideoLikes = async (req, _, next) => {
  try {
    const { _id } = req?.user;
    const { videoId } = req?.params;
    const { commentId } = req?.params;

    if (!_id || !validateObjectId(_id)) {
      throw new ApiError(400, "Unauthorized Req");
    }

    if (
      !videoId ||
      (!validateObjectId(videoId) && !commentId) ||
      !validateObjectId(commentId)
    ) {
      throw new ApiError(400, "LikeId is not available");
    }

    const redisKeyLikes = `Likes:${_id}:${videoId || commentId}`;

    const videoLikesKey = `video:${_id}:Likes`;

    const videoSyncLikes = `syncLikes:${_id}`;

    await client.watch(redisKeyLikes);

    const alreadyLikes = await client.exists(redisKeyLikes);

    const multi = client.multi();

    if (!alreadyLikes) {
      multi.set(redisKeyLikes);
      multi.set(videoLikesKey);
      multi.set(videoSyncLikes);
    } else {
      multi.del(redisKeyLikes);

      // const [videoLikeCountRaw, syncLikeCountRaw] = await Promise.all([
      //   client.get(videoLikesKey),
      //   client.get(videoSyncLikes),
      // ]);

      // const videoLikeCount = parseInt(videoLikeCountRaw) || 0;

      // const syncLikeCount = parseInt(syncLikeCountRaw) || 0;

      if (videoLikesKey.length > 0) multi.del(videoLikesKey);
      if (videoSyncLikes.length > 0) multi.del(videoSyncLikes);
    }
    const execResult = await multi.exec();

    if (!execResult) {
      throw new ApiError(409, "Like operation conflict, please retry");
    }

    next();
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

export default trackVideoLikes;
