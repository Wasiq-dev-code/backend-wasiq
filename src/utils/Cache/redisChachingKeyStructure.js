import client from "../config/redis.js";

export const cacheKeys = {
  video: (id) => `video:${id}`,
  // videoList: (page) => `videos:page:${page}`,
  user: (id) => `user:${id}`,
};

export const clearVideoCache = async (videoId) => {
  try {
    const key = cacheKeys.video(videoId);
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Error while deleting video", error);
    return false;
  }
};

export const clearUserCache = async (userId) => {
  try {
    const key = cacheKeys.user(userId);
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Error while deleting the key on redis", error);
    return false;
  }
};

export const clearVideoListCache = async (videoId) => {
  try {
    const setKey = `videoCacheKey:${videoId}`;

    const existedKey = await client.sMembers(setKey);

    if (existedKey.length >= 1) {
      const pipeline = client.multi();

      for (const key of existedKey) {
        pipeline.del(key);
      }

      pipeline.del(setKey);

      await pipeline.exec();
    }

    return true;
  } catch (error) {
    console.error("Error while deleting the key in redis", error);
    return false;
  }
};
