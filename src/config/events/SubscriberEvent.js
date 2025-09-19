import { QueueEvents } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";

// Queue events (completed, failed, etc.)
const subscriberEventQueue = new QueueEvents("subscriber-Queue-Events", {
  redisJobConnection,
});

// Process jobs with error handling
subscriberEventQueue.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed:`, returnvalue);
});

subscriberEventQueue.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

subscriberEventQueue.on("waiting", ({ jobId }) => {
  console.log(`⏳ Job ${jobId} is waiting`);
});

subscriberEventQueue.on("active", ({ jobId }) => {
  console.log(`🔄 Job ${jobId} is active`);
});

export { subscriberEventQueue };
