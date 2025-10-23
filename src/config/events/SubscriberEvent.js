/**
 * @module SubscriberQueueEvents
 * @description
 * BullMQ **Queue Events** listener for the "Subscribe" queue.
 * This module monitors and logs key lifecycle events (`completed`, `failed`, `waiting`, and `active`)
 * for jobs processed in the `Subscribe-Queue-Events` queue.
 *
 * It helps in debugging, monitoring, and maintaining visibility into background job execution.
 */

import { QueueEvents } from "bullmq";
import { redisJobConnection } from "../redisJobConnection.js";

/**
 * @constant {QueueEvents} likeQueueEvents
 * @description
 * A BullMQ `QueueEvents` instance configured to listen for events emitted by the "Subscriber" queue.
 * The connection uses the shared `redisJobConnection` configuration.
 *
 * @fires completed - Triggered when a job finishes successfully.
 * @fires failed - Triggered when a job throws an error or fails during processing.
 * @fires waiting - Triggered when a job is added to the queue but not yet processed.
 * @fires active - Triggered when a job starts being processed by a worker.
 *
 * ---
 *
 * @example
 * import { subscriberQueueEvents } from "./events/subscriberEvents.js";
 *
 * // Events are automatically logged to the console:
 * // ✅ Job 123 completed: { result: "ok" }
 * // ❌ Job 124 failed: Some error message
 * // ⏳ Job 125 is waiting
 * // 🔄 Job 126 is active
 */

// Queue events (completed, failed, etc.)
const subscriberEventQueue = new QueueEvents("subscriber-Queue-Events", {
  connection: redisJobConnection,
});

/**
 * @event completed
 * @param {Object} event
 * @param {string|number} event.jobId - The ID of the completed job.
 * @param {*} event.returnvalue - The return value from the job processor.
 * @description Logs successful job completion.
 */

// Process jobs with error handling
subscriberEventQueue.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed:`, returnvalue);
});

/**
 * @event failed
 * @param {Object} event
 * @param {string|number} event.jobId - The ID of the failed job.
 * @param {string} event.failedReason - The error message or failure reason.
 * @description Logs job failure details.
 */

subscriberEventQueue.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

/**
 * @event waiting
 * @param {Object} event
 * @param {string|number} event.jobId - The ID of the waiting job.
 * @description Logs when a job is queued and waiting for processing.
 */

subscriberEventQueue.on("waiting", ({ jobId }) => {
  console.log(`⏳ Job ${jobId} is waiting`);
});

/**
 * @event active
 * @param {Object} event
 * @param {string|number} event.jobId - The ID of the job that just became active.
 * @description Logs when a job begins processing.
 */

subscriberEventQueue.on("active", ({ jobId }) => {
  console.log(`🔄 Job ${jobId} is active`);
});

/**
 * @note
 * Uses `QueueEvents` from BullMQ to listen to queue lifecycle events.
 * The queue name `"Subscriber-Queue-Events"` should match the related worker and queue setup for consistent event handling.
 */

export { subscriberEventQueue };
