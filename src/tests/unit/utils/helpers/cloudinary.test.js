import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockUpload = jest.fn();
const mockDestroy = jest.fn();
const mockConfig = jest.fn();

jest.unstable_mockModule("cloudinary", () => ({
  v2: {
    uploader: {
      upload: mockUpload,
      destroy: mockDestroy,
    },
    config: mockConfig,
  },
}));

const mockExistsSync = jest.fn();
const mockUnlinkSync = jest.fn();

jest.unstable_mockModule("fs", () => ({
  default: {
    existsSync: mockExistsSync,
    unlinkSync: mockUnlinkSync,
  },
  existsSync: mockExistsSync,
  unlinkSync: mockUnlinkSync,
}));

const { uploadOnCloudinary, deleteOnCloudinary } = await import(
  "../../utils/helpers/cloudinary.js"
);
const { v2: cloudinary } = await import("cloudinary");
const fs = await import("fs");

describe("Cloudinary -- Unit Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Uploading on cloudinary", () => {
    test("should return null if localFilePath is not provided", async () => {
      const result = await uploadOnCloudinary(null);
      expect(result).toBeNull();
    });

    test("Should return null if file does not exist", async () => {
      fs.existsSync.mockReturnValue(false);

      const result = await uploadOnCloudinary("fake/path/image.png");
      expect(result).toBeNull();
      expect(fs.existsSync).toHaveBeenCalledWith("fake/path/image.png");
    });

    test("Should upload file successfully and delete local file", async () => {
      fs.existsSync.mockReturnValue(true);
      const mockResponse = { url: "https://cloudinary.com/image.png" };

      cloudinary.uploader.upload.mockResolvedValue(mockResponse);

      const result = await uploadOnCloudinary("valid/path/image.png");

      expect(result).toEqual(mockResponse);
      expect(fs.unlinkSync).toHaveBeenCalledWith("valid/path/image.png");
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        "valid/path/image.png",
        {
          resource_type: "auto",
        }
      );
    });

    test("should handle upload error and still try to delete file", async () => {
      fs.existsSync.mockReturnValue(true);
      cloudinary.uploader.upload.mockRejectedValue(new Error("Upload failed"));

      const result = await uploadOnCloudinary("valid/path/image.png");

      expect(result).toBeNull();
      expect(fs.unlinkSync).toHaveBeenCalledWith("valid/path/image.png");
    });
  });

  describe("Delete on cloudinary", () => {
    test("should return null if deletefile is not provided", async () => {
      const result = await deleteOnCloudinary(null);
      expect(result).toBeNull();
    });

    test("should delete file successfully", async () => {
      const mockResponse = { result: "ok" };
      cloudinary.uploader.destroy.mockResolvedValue(mockResponse);

      const result = await deleteOnCloudinary("image_public_id");
      expect(result).toEqual(mockResponse);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        "image_public_id"
      );
    });

    test("should throw ApiError when delete fails", async () => {
      const mockResponse = { result: "not found" };
      cloudinary.uploader.destroy.mockResolvedValue(mockResponse);

      const result = await deleteOnCloudinary("invalid_id");
      expect(result).toBeNull(); // because error is caught
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("invalid_id");
    });

    test("should handle errors gracefully", async () => {
      cloudinary.uploader.destroy.mockRejectedValue(
        new Error("Cloudinary error")
      );

      const result = await deleteOnCloudinary("some_id");
      expect(result).toBeNull();
    });
  });
});
