import { QueueEvents } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";

// Queue events (completed, failed, etc.)
const likeQueueEvents = new QueueEvents("like-Queue-Events", {
  redisJobConnection,
});

// Process jobs with error handling
likeQueueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed:`, returnvalue);
});

likeQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

likeQueueEvents.on("waiting", ({ jobId }) => {
  console.log(`⏳ Job ${jobId} is waiting`);
});

likeQueueEvents.on("active", ({ jobId }) => {
  console.log(`🔄 Job ${jobId} is active`);
});

export { likeQueueEvents };
