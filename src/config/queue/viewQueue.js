import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection";

export const viewSyncQueue = new Queue("view-Sync-Queue", {
  redisJobConnection,
});
