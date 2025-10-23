import "../events/SubscriberEvent.js";

import { Worker } from "bullmq";
import { subscriberSyncProcessorr } from "../../jobs/subscribeSyncProcessor.js";
import { redisJobConnection } from "../redisJobConnection.js";

export const subscriberWorker = new Worker(
  "subscriber-Worker",
  subscriberSyncProcessorr,
  { connection: redisJobConnection }
);
