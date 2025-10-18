/**
 * @object processData
 * @description
 * Utility object providing methods to **compress** and **decompress** JSON data
 * for optimized storage in Redis
 *
 * The compression is done by converting the JSON string into a Base64-encoded string.
 * When `compressData` is `false`, data is handled as plain JSON.
 */

/**
 * @method compress
 * @description
 * Converts a JavaScript object into a JSON string.
 * If `compressData` is `true`, it additionally encodes the JSON string in Base64 format.
 *
 * @param {Object} data - The data object to compress.
 * @param {boolean} compressData - Whether to compress (Base64-encode) the data.
 * @returns {string} - A JSON string (compressed or plain).
 *
 * @example
 * const payload = { userId: "123", name: "Ali" };
 *
 * const compressed = processData.compress(payload, true);
 * console.log(compressed);
 * Output (Base64): eyJ1c2VySWQiOiIxMjMiLCJuYW1lIjoiQWxpIn0=
 *
 * const plain = processData.compress(payload, false);
 * console.log(plain);
 * Output: {"userId":"123","name":"Ali"}
 */
export const processData = {
  compress: (data, compressData) => {
    return compressData
      ? Buffer.from(JSON.stringify(data)).toString("base64")
      : JSON.stringify(data);
  },

  /**
   *
   * @method decompress
   * @description
   * Decodes and parses compressed (Base64) or plain JSON strings back into JavaScript objects.
   *
   * @param {string} data - The data string to decompress.
   * @param {boolean} compressData - Whether the input is Base64-compressed.
   * @returns {Object} - The parsed JavaScript object.
   *
   * @example
   * const compressed = "eyJ1c2VySWQiOiIxMjMiLCJuYW1lIjoiQWxpIn0=";
   *
   * const result1 = processData.decompress(compressed, true);
   * console.log(result1);
   * Output: { userId: '123', name: 'Ali' }
   *
   * const plain = '{"userId":"123","name":"Ali"}';
   * const result2 = processData.decompress(plain, false);
   * console.log(result2);
   * Output: { userId: '123', name: 'Ali' }
   */

  decompress: (data, compressData) => {
    return compressData
      ? JSON.parse(Buffer.from(data, "base64").toString())
      : JSON.parse(data);
  },
};
