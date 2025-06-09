import client from "../config/redis";

export const getVideoViews = async (videoId) => {
  const views = await client.get(`video:${videoId}:views`);
  return parseInt(views) || 0;
};
