import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection";

export const subscriberSyncQueue = new Queue("subscriber-Sync-Queue", {
  redisJobConnection,
});
