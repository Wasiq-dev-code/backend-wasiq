import { Queue } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";
import { SUBSCRIBER_QUEUE_NAME } from "../../constants.js";

export const subscriberSyncQueue = new Queue(SUBSCRIBER_QUEUE_NAME, {
  connection: redisJobConnection,
});
