import { ApiError } from "../../utils/Api/ApiError";

describe("ApiError", () => {
  test("should create an ApiError with default values", () => {
    const err = new ApiError(500);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("something went wrong");
    expect(err.error).toEqual([]);
    expect(err.success).toBe(false);
    expect(err.data).toBeNull();
    expect(err.errorCode).toBeNull();
    expect(err.stack).toBeDefined();
  });

  test("should create an ApiError with custom values", () => {
    const err = new ApiError(
      404,
      "Not Found",
      ["invalid id"],
      "custom stack",
      "ERR_404"
    );

    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.error).toEqual(["invalid id"]);
    expect(err.success).toBe(false);
    expect(err.data).toBeNull();
    expect(err.errorCode).toBe("ERR_404");
    expect(err.stack).toBe("custom stack");
  });
});
