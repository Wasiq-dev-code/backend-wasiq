import { processData } from "../../utils/Cache/processData";
import { describe, expect, test } from "@jest/globals";

describe("ProcessData -- Unit Test", () => {
  const sampleObj = { name: "Wasiq", age: 15 };

  describe("Compress -- Unit Test", () => {
    test("All data should be convert into the base64 string. when flag is true", () => {
      const result = processData.compress(sampleObj, true);

      expect(typeof result).toBe("string");
      expect(result).not.toContain("Wasiq");

      const decode = JSON.parse(Buffer.from(result, "base64").toString());

      expect(decode).toEqual(sampleObj);
    });

    test("Should return JSON string. when flag is false", () => {
      const result = processData.compress(sampleObj, false);

      expect(result).toBe(JSON.stringify(sampleObj));
    });
  });

  describe("Decompress -- Unit Test", () => {
    test("The data should be decompress from compressed. when flag is true", () => {
      const result = processData.compress(sampleObj, true);

      const decode = processData.decompress(result, true);

      expect(decode).toEqual(sampleObj);
    });

    test("Should return Parse Json string back to object. when flag is false", () => {
      const plain = processData.compress(sampleObj, false);

      const result = processData.decompress(plain, false);

      expect(result).toEqual(sampleObj);
    });
  });
});
