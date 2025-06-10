import Queue from "bull";
import { viewSyncProcessor } from "../jobs/viewSyncProcessor.js";
// import "../../dotenv.js";

const viewSyncQueue = new Queue("Snyc-data-into-mongo", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

viewSyncQueue.process(viewSyncProcessor);

viewSyncQueue.on("completed", (job) => {
  console.log(`✅ [Bull] Job ${job.id} completed`);
});

viewSyncQueue.on("failed", (job, err) => {
  console.log(`❌ [Bull] Job ${job.id} failed:`, err);
});

viewSyncQueue.on("ready", () => {
  console.log(`[bull] view sync queue is ready to execute`);
});

export default viewSyncQueue;
