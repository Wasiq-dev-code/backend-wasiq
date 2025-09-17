import { createBullBoard } from "@bull-board/api";

import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js"; // 👈 use this

import { syncQueue } from "./syncQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/wasiq/admin/queue");

createBullBoard({
  queues: [new BullMQAdapter(syncQueue)], // Use BullAdapter, not BullQueueAdapter
  serverAdapter,
});

export default serverAdapter;
