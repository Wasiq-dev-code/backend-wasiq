import "../events/likeEvent.js";

import { Worker } from "bullmq";
import { likeSyncProcessor } from "../../jobs/likeSyncProcessor.js";
import { redisJobConnection } from "../redisJobConnection.js";
import { LIKE_QUEUE_NAME } from "../../constants.js";

export const likeWorker = new Worker(LIKE_QUEUE_NAME, likeSyncProcessor, {
  connection: redisJobConnection,
});
