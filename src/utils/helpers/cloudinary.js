/**
 * @file cloudinary.js
 *
 * Helper utility for uploading and deleting files on cloudinary
 *
 * Exports:
 * UploadOnCloudinary(localFilePath): Promise<Object|Null>
 * DeleteOnCloudinary(PublicId): Promise<Object|null>
 *
 * @description UploadOnCloudinary uploads a file on cloudinary [Type "Auto"] and delete the localFilePath after success or not.
 * DeleteOnCloudinary destroys a file from cloudinary by the given publicId. If error occurs give apiError. Both functions return "null" when gets Error
 *
 * @example :
 * const res = await uploadOnCloudinary('/tmp/video.mp4');
 * await deleteOnCloudinary('folder/subfolder/abc123');
 */

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "../Api/ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * @function uploadOnCloudinary
 *
 * @param {string} localFilePath  - Local system file path to upload on cloudinary
 * @returns {Promise<Object|null>} - Cloudinary reponse object on success. If error than null
 *
 *@notes :
 If the local path has an error or does not exist. Returns null.
 After gets success to upload on cloudinary or not.
 Removes file from localsystem through [fs.unlinkSync(localFilePath);].
 Uses resource_type: "auto" so images/videos/other types are handled automatically.
 */

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

/**
 * @function deleteOnCloudinary
 *
 * @param {string} deletefile - Remove file from cloudinary
 * @returns {Promise<Object|null>} - Cloudinary response object on success. or Null
 *
 * @notes :
 * If Occurs error or deletefile has an error. Return null.
 * If file get deletes but response.result !== "ok". Returns apiError.
 * Return Successfull reponse when surpassing and got no error.
 */

const deleteOnCloudinary = async (publicId, type) => {
  try {
    // console.log("deleting =>", publicId);

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
      invalidate: true,
    });

    const result = response?.result;

    // success cases
    if (result === "ok" || result === "not_found" || result === undefined) {
      return response;
    }

    // error case
    throw new Error(response.error?.message || "Cloudinary delete failed");
  } catch (err) {
    console.log("delete error =>", JSON.stringify(err, null, 2));
    throw err;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
