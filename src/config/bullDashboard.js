import { createBullBoard } from "@bull-board/api";

import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js"; // 👈 use this

import { likeSyncQueue } from "./queue/likeQueue.js";
import { subscriberSyncQueue } from "./queue/subscriberQueue.js";
import { viewSyncQueue } from "./queue/viewQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/wasiq/admin/queue");

createBullBoard({
  queues: [
    new BullMQAdapter(likeSyncQueue),
    new BullMQAdapter(subscriberSyncQueue),
    new BullMQAdapter(viewSyncQueue),
  ],
  serverAdapter,
});

export default serverAdapter;
