import { QueueEvents } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";

// Queue events (completed, failed, etc.)
const viewQueueEvents = new QueueEvents("view-Queue-Events", {
  redisJobConnection,
});

// Process jobs with error handling
viewQueueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed:`, returnvalue);
});

viewQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

viewQueueEvents.on("waiting", ({ jobId }) => {
  console.log(`⏳ Job ${jobId} is waiting`);
});

viewQueueEvents.on("active", ({ jobId }) => {
  console.log(`🔄 Job ${jobId} is active`);
});

export { viewQueueEvents };
