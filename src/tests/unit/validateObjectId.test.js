import mongoose from "mongoose";
import { validateObjectId } from "../../utils/helpers/validateObjectId";
import { describe, expect, test } from "@jest/globals";
import { ApiError } from "../../utils/Api/ApiError";

describe("ValidateObjectId -- Unit Test", () => {
  test("Should return object id when given a valid id", () => {
    const validId = new mongoose.Types.ObjectId().toString();

    const result = validateObjectId(validId, "UserId");

    expect(result).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(result.toString()).toBe(validId);
  });

  test("Should return ApiError when userId is missing", () => {
    expect(() => validateObjectId(null, "UserId")).toThrow(ApiError);
    expect(() => validateObjectId(null, "UserId")).toThrow(
      "UserId is not an ObjectId"
    );
  });

  test("Should return ApiError when userId is not an object ", () => {
    const invalidId = "1231232341223";
    expect(() => validateObjectId(invalidId, "UserId")).toThrow(ApiError);
    expect(() => validateObjectId(invalidId, "UserId")).toThrow(
      "UserId is not an ObjectId"
    );
  });
});
