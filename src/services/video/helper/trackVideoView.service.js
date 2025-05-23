import client from "../../../config/redis.js";
import { ApiError } from "../../../utils/ApiError.js";
import { Video } from "../../../models/Video.model.js";
import { clearVideoCache } from "../../../utils/redisChachingKeyStructure.js";
import { TTL } from "../../../constants.js";

const trackVideoView = async (videoId, ip) => {
  try {
    if (!videoId?.trim() || !ip?.trim()) {
      throw new ApiError(400, "Invalid ip address or videoId");
    }

    const sanitizedVideoId = videoId.trim();
    const sanitizedIp = ip.trim().replace(/[^a-zA-Z0-9:.]/g, "");

    const redisKey = `view:${sanitizedVideoId}:${sanitizedIp}`;
    const alreadyViewed = await client.exists(redisKey);

    if (!alreadyViewed) {
      const updateVideoView = await Video.findByIdAndUpdate(
        videoId,
        {
          $inc: {
            views: 1,
          },
        },
        {
          new: true,
        }
      );

      if (!updateVideoView) {
        throw new ApiError(404, "Video not found");
      }

      await client.set(redisKey, "1", { EX: TTL.ONE_DAY, NX: true });
      await clearVideoCache(videoId);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error while tracking the views", {
      videoId,
      ip,
      error: error?.message || error,
    });

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Unsucessfull to execute trackVideoView");
  }
};

export default trackVideoView;
