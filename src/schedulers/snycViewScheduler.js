import viewSyncQueue from "../queues/viewSyncQueue.js";

if (process.env.NODE_ENV === "production") {
  viewSyncQueue.add(
    {},
    {
      repeat: {
        cron: "*/5 * * * *",
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
