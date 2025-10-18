/**
 * @module RepeatableJobsCleaner
 * @description
 * Utility module to "clean up repeatable jobs" from different BullMQ queues — specifically for likes, views, and subscribers.
 *
 * Each function retrieves all existing repeatable jobs from its respective queue and removes them one by one.
 * Useful during application startup, deployment, or maintenance to ensure no duplicate or outdated repeatable jobs remain in.
 *
 */

import { likeSyncQueue } from "../../config/queue/likeQueue.js";
import { viewSyncQueue } from "../../config/queue/viewQueue.js";
import { subscriberSyncQueue } from "../../config/queue/subscriberQueue.js";

/**
 * @function getRepeatableLikesJobs
 * @description
 * Removes all repeatable jobs from the `likeSyncQueue`.
 * Logs each removed job and prints a confirmation message after completion.
 *
 * @returns {Promise<void>}
 * Resolves when all repeatable "like" jobs have been cleared.
 *
 * @example
 * await getRepeatableLikesJobs();
 * Output:
 * Removed Likes job: repeat::syncLikes
 * Repeatable Likes jobs cleaned.
 *
 */

const getRepeatableLikesJobs = async () => {
  const jobs = await likeSyncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await likeSyncQueue.removeRepeatableByKey(job.key);
    console.log(`Removed Likes job: ${job.key}`);
  }

  console.log("Repeatable Likes jobs cleaned.");
};

/**
 * @function getRepeatableViewJobs
 * @description
 * Removes all repeatable jobs from the `viewSyncQueue`.
 * Logs each removed job and prints a confirmation message after completion.
 *
 * @returns {Promise<void>}
 * Resolves when all repeatable "view" jobs have been cleared.
 *
 * @example
 * await getRepeatableViewJobs();
 * Output:
 * Removed View job: repeat::syncViews
 * Repeatable View jobs cleaned.
 */

const getRepeatableViewJobs = async () => {
  const jobs = await viewSyncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await viewSyncQueue.removeRepeatableByKey(job.key);
    console.log(`Removed View job: ${job.key}`);
  }

  console.log("Repeatable View jobs cleaned.");
};

/**
 * @function getRepeatableSubscriberJobs
 * @description
 * Removes all repeatable jobs from the `subscriberSyncQueue`.
 * Logs each removed job and prints a confirmation message after completion.
 *
 * @returns {Promise<void>}
 * Resolves when all repeatable "subscriber" jobs have been cleared.
 *
 * @example
 * await getRepeatableSubscriberJobs();
 * Output:
 * Removed Subscriber job: repeat::syncSubscribers
 * Repeatable Subscriber jobs cleaned.
 */

const getRepeatableSubscriberJobs = async () => {
  const jobs = await subscriberSyncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await subscriberSyncQueue.removeRepeatableByKey(job.key);
    console.log(`Removed Subscriber job: ${job.key}`);
  }

  console.log("Repeatable Subscriber jobs cleaned.");
};

/**
 * @note
 * Designed for use with BullMQ queues.
 * Recommended to run these functions before queue initialization or job re-registration.
 * Each function safely iterates through all repeatable jobs and removes them by their unique job key.
 */

export {
  getRepeatableLikesJobs,
  getRepeatableViewJobs,
  getRepeatableSubscriberJobs,
};
