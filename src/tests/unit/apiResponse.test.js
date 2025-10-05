import { ApiResponse } from "../../utils/Api/ApiResponse";
import { expect } from "@jest/globals";

describe("ApiResponse", () => {
  test("Should create an ApiResponse with default values", () => {
    const res = new ApiResponse(200);

    expect(res).toBeInstanceOf(ApiResponse);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual([]);
    expect(res.message).toBe("Success");
    expect(res.success).toBe(true);
  });

  test("Should create an ApiResponse with custom values", () => {
    const data = { id: 1, name: "wasiq" };
    const res = new ApiResponse(201, data, "created");

    expect(res.statusCode).toBe(201);
    expect(res.data).toEqual(data);
    expect(res.message).toBe("created");
    expect(res.success).toBe(true);
  });

  test("Should mark success as false when statuscode >= 400", () => {
    const res = new ApiResponse(404, null, "not found");

    expect(res.statusCode).toBe(404);
    expect(res.data).toBeNull();
    expect(res.message).toBe("not found");
    expect(res.success).toBe(false);
  });
});
