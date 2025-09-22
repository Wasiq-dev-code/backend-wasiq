import { likeSyncQueue } from "../../config/queue/likeQueue.js";
import { viewSyncQueue } from "../../config/queue/viewQueue.js";
import { subscriberSyncQueue } from "../../config/queue/subscriberQueue.js";

const getRepeatableLikesJobs = async () => {
  const jobs = await likeSyncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await likeSyncQueue.removeRepeatableByKey(job.key);
    console.log(`❌ Removed Likes job: ${job.key}`);
  }

  console.log("✅ Repeatable Likes jobs cleaned.");
};

const getRepeatableViewJobs = async () => {
  const jobs = await viewSyncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await viewSyncQueue.removeRepeatableByKey(job.key);
    console.log(`❌ Removed View job: ${job.key}`);
  }

  console.log("✅ Repeatable View jobs cleaned.");
};

const getRepeatableSubscriberJobs = async () => {
  const jobs = await subscriberSyncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await subscriberSyncQueue.removeRepeatableByKey(job.key);
    console.log(`❌ Removed Subscriber job: ${job.key}`);
  }

  console.log("✅ Repeatable Subscriber jobs cleaned.");
};

export {
  getRepeatableLikesJobs,
  getRepeatableViewJobs,
  getRepeatableSubscriberJobs,
};
