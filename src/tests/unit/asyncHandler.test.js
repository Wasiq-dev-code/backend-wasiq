import { asyncHandler } from "../../utils/helpers/asyncHandler";
import { expect, jest } from "@jest/globals";

describe("AsyncHandler", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  test("Wrapped function works successfully", async () => {
    const mockfn = jest.fn().mockResolvedValue("done");

    const handler = asyncHandler(mockfn);

    await handler(req, res, next);

    expect(mockfn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  test("Wrapped function successfully returns an error", async () => {
    const error = new Error("test error");
    const mockfn = jest.fn().mockRejectedValue(error);

    const handler = asyncHandler(mockfn);

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
