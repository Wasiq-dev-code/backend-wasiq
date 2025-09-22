import { Worker } from "bullmq";
import { likeSyncProcessor } from "../../jobs/likeSyncProcessor.js";
import { redisJobConnection } from "../redisJobConnection.js";

export const likeWorker = new Worker("like-Worker", likeSyncProcessor, {
  connection: redisJobConnection,
});
