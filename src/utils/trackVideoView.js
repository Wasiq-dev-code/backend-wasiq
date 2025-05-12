import client from "../config/redis";
import { Video } from "../models/Video.model";

const trackVideoView = async (videoId, ip) => {
  try {
    const redisKey = `view:${videoId}:${ip}`;

    const alreadyViewed = await client.exists(redisKey);

    if (!alreadyViewed) {
      await Video.findByIdAndUpdate(videoId, {
        $inc: {
          views: 1,
        },
      });

      await client.set(redisKey, "1", { EX: 86400 });
    }
  } catch (error) {
    console.error("Error while tracking the views", error);
  }
};

export default trackVideoView;
