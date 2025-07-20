import Queue from "bull";
import { viewSyncProcessor } from "../jobs/viewSyncProcessor.js";

const viewSyncQueue = new Queue("Sync-data-into-mongo", {
  redis: process.env.REDIS_URL,
});

// Process jobs with error handling
viewSyncQueue.process(1, viewSyncProcessor); // Add concurrency limit

// Event listeners
viewSyncQueue.on("completed", (job, result) => {
  console.log(`✅ [Bull] Job ${job.id} completed successfully`);
  console.log(`📊 Result:`, result);
});

viewSyncQueue.on("failed", (job, err) => {
  console.error(`❌ [Bull] Job ${job.id} failed:`, err.message);
  console.error(`🔍 Job data:`, job.data);
});

viewSyncQueue.on("active", (job) => {
  console.log(`🔄 [Bull] Job ${job.id} started processing`);
});

viewSyncQueue.on("waiting", (jobId) => {
  console.log(`⏳ [Bull] Job ${jobId} is waiting`);
});

viewSyncQueue.on("ready", () => {
  console.log(`🚀 [Bull] Queue ready to execute jobs`);
});

viewSyncQueue.on("error", (error) => {
  console.error(`💥 [Bull] Queue error:`, error.message);
});

// Connection event for Redis
viewSyncQueue.on("stalled", (job) => {
  console.warn(`⚠️ [Bull] Job ${job.id} stalled`);
});

// Test queue connection
viewSyncQueue
  .isReady()
  .then(() => {
    console.log(`✅ [Bull] Redis connection established`);
  })
  .catch((err) => {
    console.error(`❌ [Bull] Redis connection failed:`, err.message);
  });

export default viewSyncQueue;
