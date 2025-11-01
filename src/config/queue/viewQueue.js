import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";
import { VIEW_QUEUE_NAME } from "../../constants.js";

export const viewSyncQueue = new Queue(VIEW_QUEUE_NAME, {
  connection: redisJobConnection,
});
