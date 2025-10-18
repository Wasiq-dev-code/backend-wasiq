/**
 * @file "../../config/database/mongoose.config.js"
 */

import { describe, expect, jest, test } from "@jest/globals";
import { dbName } from "../../constants.js";

jest.unstable_mockModule("mongoose", () => ({
  default: {
    connect: jest.fn(),
  },
}));

const { default: mongoose } = await import("mongoose");
const { default: connectMongo } = await import(
  "../../config/database/mongoose.config.js"
);

const mockUri = "mongodb://localhost:27017";

beforeEach(() => {
  process.env.MONGO_URI = mockUri;
  jest.clearAllMocks();
});

describe("ConnectMongo -- Mock Test", () => {
  test("Should connect to mongoDb successfully", async () => {
    mongoose.connect.mockResolvedValueOnce({
      connection: {
        host: "localhost",
      },
    });

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await connectMongo();

    expect(mongoose.connect).toHaveBeenCalledWith(`${mockUri}/${dbName}`);
    expect(consoleSpy).toHaveBeenCalledWith("MongoDB connected:", "localhost");

    consoleSpy.mockRestore();
  });

  test("Should log error and exit on failure", async () => {
    const mockError = new Error("redis Error");
    mongoose.connect.mockRejectedValueOnce(mockError);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    await connectMongo();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error while connecting to DB:",
      mockError
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
