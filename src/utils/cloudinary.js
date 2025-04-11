///FILE UPLOADING SYSTEM AT CLOUDINARY

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

///@param {cloudinary.config} is inbuilt method of cloudinary website

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/// @param {uploadOnCloudinary} containing local system path and uploading at cloudinary, scenerio of facing error, unlink the file locally

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file successfully uploaded at cloudinary", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
