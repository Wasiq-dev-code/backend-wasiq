import viewSyncQueue from "../../config/viewSyncQueue.js";

const getRepeatableJobs = async () => {
  const jobs = await viewSyncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await viewSyncQueue.removeRepeatableByKey(job.key);
    console.log(`❌ Removed job: ${job.key}`);
  }

  console.log("✅ Repeatable jobs cleaned.");
};

export default getRepeatableJobs;
