import "../events/SubscriberEvent.js";

import { Worker } from "bullmq";
import { subscriberSyncProcessorr } from "../../jobs/subscribeSyncProcessor.js";
import { redisJobConnection } from "../redisJobConnection.js";
import { SUBSCRIBER_QUEUE_NAME } from "../../constants.js";

export const subscriberWorker = new Worker(
  SUBSCRIBER_QUEUE_NAME,
  subscriberSyncProcessorr,
  { connection: redisJobConnection }
);
