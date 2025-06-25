// bullscheduler.js ya scheduler file me
import viewSyncQueue from "../queues/viewSyncQueue.js";

viewSyncQueue.add(
  { source: "test" }, // optional: custom test data
  {
    repeat: {
      cron: "*/1 * * * *", // every minute
    },
    removeOnComplete: true,
    removeOnFail: true,
    jobId: "test-sync-every-minute", // avoid duplicate jobs
  }
);
