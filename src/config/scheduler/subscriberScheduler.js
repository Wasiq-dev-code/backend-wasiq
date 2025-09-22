// bullscheduler.js
import { subscriberSyncQueue } from "../queue/subscriberQueue.js"; // BullMQ queue
import { getRepeatableSubscriberJobs } from "../../utils/Cache/getRepeatableJobs.js";

(async () => {
  // Pehle jo repeatable jobs already lage hue hain, wo check kar le
  await getRepeatableSubscriberJobs();

  // Ab repeatable job add kar
  await subscriberSyncQueue.add(
    "subscriber-sync-job", // Job ka name (required BullMQ me)
    { action: "subscriber-sync" }, // Job ka data
    {
      jobId: "subscriber-sync-job", // Unique ID (same rakhega to duplicate avoid hoga)
      repeat: {
        cron: "*/2 * * * *", // Har 50 minute ke interval pe
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
})();
