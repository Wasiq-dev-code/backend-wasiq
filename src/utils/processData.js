export const processData = {
  compress: (data, compressData) => {
    return compressData
      ? Buffer.from(JSON.stringify(data)).toString("base64")
      : JSON.stringify(data);
  },

  decompress: (data, compressData) => {
    return compressData
      ? JSON.parse(Buffer.from(data, "base64").toString())
      : JSON.parse(data);
  },
};
