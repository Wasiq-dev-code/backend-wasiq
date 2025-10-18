import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

const mockLikeQueue = {
  getRepeatableJobs: jest.fn(),
  removeRepeatableByKey: jest.fn(),
};
const mockViewQueue = {
  getRepeatableJobs: jest.fn(),
  removeRepeatableByKey: jest.fn(),
};
const mockSubscriberQueue = {
  getRepeatableJobs: jest.fn(),
  removeRepeatableByKey: jest.fn(),
};

// Mock queue modules
jest.unstable_mockModule("../../config/queue/likeQueue.js", () => ({
  __esModule: true,
  likeSyncQueue: mockLikeQueue,
}));

jest.unstable_mockModule("../../config/queue/viewQueue.js", () => ({
  __esModule: true,
  viewSyncQueue: mockViewQueue,
}));

jest.unstable_mockModule("../../config/queue/subscriberQueue.js", () => ({
  __esModule: true,
  subscriberSyncQueue: mockSubscriberQueue,
}));

let getRepeatableLikesJobs, getRepeatableViewJobs, getRepeatableSubscriberJobs;

beforeAll(async () => {
  const mod = await import("../../utils/Cache/getRepeatableJobs.js");
  getRepeatableLikesJobs = mod.getRepeatableLikesJobs;
  getRepeatableViewJobs = mod.getRepeatableViewJobs;
  getRepeatableSubscriberJobs = mod.getRepeatableSubscriberJobs;
});

describe("Cleanup Repeatable Jobs -- Unit Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRepeatableLikesJobs", () => {
    it("should remove all repeatable like jobs", async () => {
      mockLikeQueue.getRepeatableJobs.mockResolvedValue([
        { key: "like-job-1" },
        { key: "like-job-2" },
      ]);
      mockLikeQueue.removeRepeatableByKey.mockResolvedValue();

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      await getRepeatableLikesJobs();

      expect(mockLikeQueue.getRepeatableJobs).toHaveBeenCalledTimes(1);
      expect(mockLikeQueue.removeRepeatableByKey).toHaveBeenCalledTimes(2);
      expect(mockLikeQueue.removeRepeatableByKey).toHaveBeenCalledWith(
        "like-job-1"
      );
      expect(logSpy).toHaveBeenCalledWith("✅ Repeatable Likes jobs cleaned.");

      logSpy.mockRestore();
    });
  });

  describe("getRepeatableViewJobs", () => {
    it("should remove all repeatable view jobs", async () => {
      mockViewQueue.getRepeatableJobs.mockResolvedValue([
        { key: "view-job-1" },
      ]);
      mockViewQueue.removeRepeatableByKey.mockResolvedValue();

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      await getRepeatableViewJobs();

      expect(mockViewQueue.getRepeatableJobs).toHaveBeenCalledTimes(1);
      expect(mockViewQueue.removeRepeatableByKey).toHaveBeenCalledWith(
        "view-job-1"
      );
      expect(logSpy).toHaveBeenCalledWith("✅ Repeatable View jobs cleaned.");

      logSpy.mockRestore();
    });
  });

  describe("getRepeatableSubscriberJobs", () => {
    it("should remove all repeatable subscriber jobs", async () => {
      mockSubscriberQueue.getRepeatableJobs.mockResolvedValue([
        { key: "sub-job-1" },
      ]);
      mockSubscriberQueue.removeRepeatableByKey.mockResolvedValue();

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      await getRepeatableSubscriberJobs();

      expect(mockSubscriberQueue.getRepeatableJobs).toHaveBeenCalledTimes(1);
      expect(mockSubscriberQueue.removeRepeatableByKey).toHaveBeenCalledWith(
        "sub-job-1"
      );
      expect(logSpy).toHaveBeenCalledWith(
        "✅ Repeatable Subscriber jobs cleaned."
      );

      logSpy.mockRestore();
    });
  });
});
