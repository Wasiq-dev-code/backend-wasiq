import { Queue, Worker, QueueEvents } from "bullmq";
import { viewSyncProcessor } from "../jobs/viewSyncProcessor.js";

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  username: "default",
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false,
  },
};

const syncQueue = new Queue("Sync-data-into-mongo", { connection });

// Worker for processing jobs
const worker = new Worker("Sync-data-into-mongo", viewSyncProcessor, {
  connection,
});

// Queue events (completed, failed, etc.)
const queueEvents = new QueueEvents("Sync-data-into-mongo", { connection });

// Process jobs with error handling
queueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed:`, returnvalue);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

queueEvents.on("waiting", ({ jobId }) => {
  console.log(`⏳ Job ${jobId} is waiting`);
});

queueEvents.on("active", ({ jobId }) => {
  console.log(`🔄 Job ${jobId} is active`);
});

export { syncQueue, worker, queueEvents };
