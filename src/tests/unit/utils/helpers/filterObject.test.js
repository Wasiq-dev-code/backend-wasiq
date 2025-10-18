import filterObject from "../../utils/helpers/filterObject";
import { describe, expect, test } from "@jest/globals";

describe("FilterObject -- Unit Test", () => {
  test("Expecting to pass with an untrim strings", () => {
    const body = {
      id: 12,
      title: "    Bly manor    ",
      description: "    Bly manor is a horror movie    ",
    };

    const fields = ["title", "description"];

    const result = filterObject(body, fields);

    expect(result).toEqual({
      title: "Bly manor",
      description: "Bly manor is a horror movie",
    });
  });

  test("Expecting to ignore not allowed values", () => {
    const body = {
      title: "Bly manor",
      extraValue: "something extra", // NOT ALLOWED VALUE
    };

    const fields = ["title", "description"];

    const result = filterObject(body, fields);

    expect(result).toEqual({
      title: "Bly manor",
    });
  });

  test("Expecting to ignore undefined and empty strings", () => {
    const body = {
      title: "    ",
      extraValue: undefined,
    };
    const fields = ["title", "description"];

    const result = filterObject(body, fields);

    expect(result).toEqual({});
  });

  test("returns {} when error occurs", () => {
    const result = filterObject(null, ["title"]);
    expect(result).toEqual({});
  });
});
