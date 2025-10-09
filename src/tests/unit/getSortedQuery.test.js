import { getSortedQuery } from "../../utils/helpers/getSortedQuery.js";
import { describe, expect, test } from "@jest/globals";

describe("getSortedQuery -- Unit Test", () => {
  test("Expecting to sort an object to alphabetical string", () => {
    const query = {
      age: 10,
      name: "wim",
    };

    const result = getSortedQuery(query);

    expect(result).toBe("age=10&name=wim");
  });

  test("should handle single key object", () => {
    const query = { z: 99 };
    const result = getSortedQuery(query);

    expect(result).toBe("z=99");
  });

  test("should return empty string for empty object", () => {
    const query = {};
    const result = getSortedQuery(query);

    expect(result).toBe("");
  });

  test("should handle numeric values correctly", () => {
    const query = { b: 20, a: 10 };
    const result = getSortedQuery(query);

    expect(result).toBe("a=10&b=20");
  });

  test("should handle the object which has multiple type of data", () => {
    const query = { b: 20, a: "madd" };
    const result = getSortedQuery(query);

    expect(result).toBe("a=madd&b=20");
  });

  test("should return empty string if query is null or undefined", () => {
    expect(getSortedQuery(undefined)).toBe("");
    expect(getSortedQuery(null)).toBe("");
  });
});
