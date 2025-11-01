import "../events/viewEvent.js";

import { Worker } from "bullmq";
import { viewSyncProcessor } from "../../jobs/viewSyncProcessor.js";
import { redisJobConnection } from "../redisJobConnection.js";
import { VIEW_QUEUE_NAME } from "../../constants.js";

export const viewWorker = new Worker(VIEW_QUEUE_NAME, viewSyncProcessor, {
  connection: redisJobConnection,
});
