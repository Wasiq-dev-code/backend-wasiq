///FILE UPLOADING SYSTEM AT CLOUDINARY

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

///@param {cloudinary.config} is inbuilt method of cloudinary website

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("File not found at path:", localFilePath);
      return null;
    }

    // Upload file to cloudinary
    console.log("Attempting to upload to Cloudinary:");
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // automatically detect file type
    });
    // console.log(response);

    // Remove the locally saved file
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // Don't delete the file on error so you can debug
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
