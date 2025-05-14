const filterObject = (sourceObj, allowedFields) => {
  try {
    const update = {};

    for (const key of allowedFields) {
      if (
        sourceObj[key] !== undefined &&
        typeof sourceObj[key] === String &&
        sourceObj[key].trim() !== ""
      ) {
        update[key] = sourceObj[key].trim();
      }
    }

    return update;
  } catch (error) {
    console("error is appeared", error);
    return {};
  }
};

export default filterObject;
