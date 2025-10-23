import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const onMock = jest.fn();

const QueueEventsMock = jest.fn(() => ({
  on: onMock,
}));

let likeQueueEvents;
let redisJobConnection;
let QueueEventsConstructor;

beforeEach(async () => {
  jest.resetModules();
  onMock.mockClear();
  QueueEventsMock.mockClear();

  jest.unstable_mockModule("bullmq", () => ({
    QueueEvents: QueueEventsMock,
  }));

  const mod = await import("../../../config/events/likeEvent.js");
  const redisMod = await import("../../../config/redisJobConnection.js");
  const bullmq = await import("bullmq");

  likeQueueEvents = mod.likeQueueEvents;
  redisJobConnection = redisMod.redisJobConnection;
  QueueEventsConstructor = bullmq.QueueEvents;
});

describe("LikeEvent -- Unit Test", () => {
  test("Should create Queue with correct name and connection", () => {
    expect(QueueEventsConstructor).toHaveBeenCalledTimes(1);
    expect(QueueEventsConstructor).toHaveBeenCalledWith("like-Queue-Events", {
      connection: redisJobConnection,
    });
  });
  test("Should register event listeners", () => {
    expect(onMock).toHaveBeenCalledWith("completed", expect.any(Function));
    expect(onMock).toHaveBeenCalledWith("failed", expect.any(Function));
  });
});
