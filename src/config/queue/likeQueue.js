import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection";

export const likeSyncQueue = new Queue("like-Sync-Queue", {
  redisJobConnection,
});
