import client from "../config/redis";
import { TTL } from "../constants";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId.js";

const trackVideoLikes = async (req, _, next) => {
  try {
    const { _id } = req?.user;
    const { videoId } = req?.params;

    if (!_id || !validateObjectId(_id)) {
      throw new ApiError(400, "Unauthorized Req");
    }

    if (!videoId || !validateObjectId(videoId)) {
      throw new ApiError(400, "VideoId is not available");
    }

    const redisKeyLikes = `Likes:${_id}:${videoId}`;

    const videoLikesKey = `video:${videoId}:Likes`;

    const videoSyncLikes = `videoSyncLikes:${videoId}`;

    await client.watch(redisKeyLikes);

    const alreadyLikes = await client.exists(redisKeyLikes);

    const multi = client.multi();

    if (!alreadyLikes) {
      multi.set(redisKeyLikes, "1", "EX", TTL.LIKES);

      multi.incr(videoLikesKey);

      multi.incr(videoSyncLikes);
    } else {
      multi.del(redisKeyLikes);

      const [videoLikeCountRaw, syncLikeCountRaw] = await Promise.all([
        client.get(videoLikesKey),
        client.get(videoSyncLikes),
      ]);

      const videoLikeCount = parseInt(videoLikeCountRaw) || 0;

      const syncLikeCount = parseInt(syncLikeCountRaw) || 0;

      if (videoLikeCount > 0) multi.decr(videoLikesKey);
      if (syncLikeCount > 0) multi.decr(videoSyncLikes);
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
