// bullscheduler.js ya scheduler file me
import viewSyncQueue from "./viewSyncQueue.js";
import getRepeatableJobs from "../utils/getRepeatableJobs.js";

getRepeatableJobs().then(() => {
  viewSyncQueue.add(
    {},
    {
      jobId: "sync-job",
      repeat: {
        cron: "*/50 * * * *",
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
});
