import viewSyncQueue from "../queues/viewSyncQueue.js";

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
