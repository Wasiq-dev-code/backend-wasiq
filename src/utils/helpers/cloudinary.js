///FILE UPLOADING SYSTEM AT CLOUDINARY

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "../Api/ApiError.js";

///@param {cloudinary.config} is inbuilt method of cloudinary website

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    if (!fs.existsSync(localFilePath)) {
      console.error("File not found at path:", localFilePath);
      return null;
    }

    console.log("Attempting to upload to Cloudinary:");
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    try {
      fs.unlinkSync(localFilePath);
    } catch (error) {
      console.log("error while deleting the file on the server");
    }

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);

    try {
      fs.unlinkSync(localFilePath);
    } catch (error) {
      console.log("error while deleting the file on the server");
    }

    return null;
  }
};

const deleteOnCloudinary = async (deletefile) => {
  try {
    if (!deletefile) return null;

    const response = await cloudinary.uploader.destroy(deletefile);

    if (response.result !== "ok") {
      throw new ApiError(500, "error while deleting cloudinary file");
    }

    return response;
  } catch (error) {
    console.log("accuring error while deleting file on cloudinary");

    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
