/**
 * @function filterObject
 * @description - Create a copy of `sourceObj` containing only the allowed fields.
 * Only string values are trimmed and included.
 * Fields with `undefined`, empty strings or non-string types are skipped.
 *
 * This is useful for sanitizing input (e.g., update) before
 * passing to DB update operations.
 *
 * @param {Object} sourceObj - Source object to filter (e.g., req.body)
 * @param {string[]} allowedFields - Array of keys that are needs to return with perfect strings.
 * @returns {Object} A new object containing only allowed, non-empty string fields
 *
 * @example
 * const payload = {
 * name: '  Ali  ',
 * age: 25,
 * bio: ''
 * };
 * const allowed = ['name', 'bio'];
 * const result = filterObject(payload, allowed);
 * // result -> { name: 'Ali' }
 *
 * Notes:
 * - Function does not mutate the original `sourceObj` but returns a new object with string values.
 * - If you want to include non-string fields (numbers/booleans), either adjust this function or convert values to strings before calling it.
 */

const filterObject = (sourceObj, allowedFields) => {
  try {
    const update = {};

    for (const key of allowedFields) {
      if (
        sourceObj[key] !== undefined &&
        typeof sourceObj[key] === "string" &&
        sourceObj[key].trim() !== ""
      ) {
        update[key] = sourceObj[key].trim();
      }
    }

    return update;
  } catch (error) {
    console.log("error is appeared", error);
    return {};
  }
};

export default filterObject;
