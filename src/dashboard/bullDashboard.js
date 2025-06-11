import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";

import viewSyncQueue from "../queues/viewSyncQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queue");

createBullBoard({
  queues: [new BullAdapter(viewSyncQueue)],
  serverAdapter,
});

export default serverAdapter;
