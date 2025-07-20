import client from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { TTL } from "../constants.js";

export const trackVideoView = async (req, _, next) => {
  try {
    const { videoId } = req.params;
    const { ip } = req;

    if (!videoId) {
      throw new ApiError(404, "VideoId is not found");
    }

    if (!ip?.trim()) {
      throw new ApiError(400, "Invalid ip address or videoId");
    }

    const sanitizedIp = ip.trim().replace(/[^a-zA-Z0-9:.]/g, "");

    const redisKeyViews = `view:${sanitizedIp}:${videoId}`;

    const videoViewKey = `video:${videoId}:views`;

    const videoSync = `videoSync:${videoId}`;

    const alreadyViewed = await client.exists(redisKeyViews);

    if (!alreadyViewed) {
      await client.set(redisKeyViews, "1", "EX", TTL.MEDIUM, "NX");

      await client.incr(videoViewKey);
      await client.incr(videoSync);
    }
    next();
  } catch (error) {
    console.error("Error while tracking the views", {
      error: error?.message || error,
    });

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Unsucessfull to execute trackVideoView");
  }
};

export default trackVideoView;
