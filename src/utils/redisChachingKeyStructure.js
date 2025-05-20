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

export const clearVideoListCache = async () => {
  try {
    const key = await client.sMembers("videoListKeys");
    if (key.length >= 1) {
      await client.del(...key);
      await client.del("videoListKeys");
    }
    return true;
  } catch (error) {
    console.error("Error while deleting the key on redis", error);
    return false;
  }
};
