// bullscheduler.js
import { syncQueue } from "./syncQueue.js"; // BullMQ queue
import getRepeatableJobs from "../utils/Cache/getRepeatableJobs.js";

(async () => {
  // Pehle jo repeatable jobs already lage hue hain, wo check kar le
  await getRepeatableJobs();

  // Ab repeatable job add kar
  await syncQueue.add(
    "sync-job", // Job ka name (required BullMQ me)
    { action: "sync" }, // Job ka data
    {
      jobId: "sync-job", // Unique ID (same rakhega to duplicate avoid hoga)
      repeat: {
        cron: "*/2 * * * *", // Har 50 minute ke interval pe
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
})();
