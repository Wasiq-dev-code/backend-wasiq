import { Worker } from "bullmq";
import { viewSyncProcessor } from "../../jobs/viewSyncProcessor.js";
import { redisJobConnection } from "../redisJobConnection.js";

export const likeWorker = new Worker("view-Worker", viewSyncProcessor, {
  connection: redisJobConnection,
});
