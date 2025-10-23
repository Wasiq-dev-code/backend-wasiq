import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const onMock = jest.fn();

const QueueEventsMock = jest.fn(() => ({
  on: onMock,
}));

let viewQueueEvent;
let redisJobConnection;
let QueueEventsConstructor;

beforeEach(async () => {
  jest.resetModules();
  onMock.mockClear();
  QueueEventsMock.mockClear();

  jest.unstable_mockModule("bullmq", () => ({
    QueueEvents: QueueEventsMock,
  }));

  const mod = await import("../../../config/events/viewEvent.js");
  const redisMod = await import("../../../config/redisJobConnection.js");
  const bullmq = await import("bullmq");

  viewQueueEvent = mod.viewQueueEvents;
  redisJobConnection = redisMod.redisJobConnection;
  QueueEventsConstructor = bullmq.QueueEvents;
});

describe("ViewEvent -- Unit Test", () => {
  test("Should create Queue with correct name and connection", () => {
    expect(QueueEventsConstructor).toHaveBeenCalledTimes(1);
    expect(QueueEventsConstructor).toHaveBeenCalledWith("view-Queue-Events", {
      connection: redisJobConnection,
    });
  });
  test("Should register event listeners", () => {
    expect(onMock).toHaveBeenCalledWith("completed", expect.any(Function));
    expect(onMock).toHaveBeenCalledWith("failed", expect.any(Function));
  });
});
