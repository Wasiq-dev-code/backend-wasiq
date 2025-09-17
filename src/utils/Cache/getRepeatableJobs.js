import { syncQueue } from "../../config/syncQueue.js";

const getRepeatableJobs = async () => {
  const jobs = await syncQueue.getRepeatableJobs();

  for (const job of jobs) {
    await syncQueue.removeRepeatableByKey(job.key);
    console.log(`❌ Removed job: ${job.key}`);
  }

  console.log("✅ Repeatable jobs cleaned.");
};

export default getRepeatableJobs;
