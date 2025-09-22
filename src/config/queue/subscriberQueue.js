import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";

export const subscriberSyncQueue = new Queue("subscriber-Sync-Queue", {
  connection: redisJobConnection,
});
