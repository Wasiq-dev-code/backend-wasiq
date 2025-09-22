import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";

export const viewSyncQueue = new Queue("view-Sync-Queue", {
  connection: redisJobConnection,
});
