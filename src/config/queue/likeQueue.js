import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";
import { LIKE_QUEUE_NAME } from "../../constants.js";

export const likeSyncQueue = new Queue(LIKE_QUEUE_NAME, {
  connection: redisJobConnection,
});
