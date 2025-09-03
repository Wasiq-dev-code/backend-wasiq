import { createBullBoard } from "@bull-board/api";

import { ExpressAdapter } from "@bull-board/express";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";

import viewSyncQueue from "../../queues/viewSyncQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queue");

createBullBoard({
  queues: [new BullAdapter(viewSyncQueue)], // Use BullAdapter, not BullQueueAdapter
  serverAdapter,
});

export default serverAdapter;
