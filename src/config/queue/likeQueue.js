import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";

export const likeSyncQueue = new Queue("like-Sync-Queue", {
  connection: redisJobConnection,
});
