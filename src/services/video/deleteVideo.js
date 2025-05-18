import { Video } from "../../models/Video.model";
import { ApiError } from "../../utils/ApiError";
import { deleteOnCloudinary } from "../../utils/cloudinary";

export const deleteVideo = async ({ video }) => {
  try {
    if (!video?.videoFile_publicId || !video?.thumbnail_publicId) {
      throw new ApiError(404, "Invalid video data");
    }

    try {
      await Promise.all([
        deleteOnCloudinary(video.videoFile_publicId),
        deleteOnCloudinary(video.thumbnail_publicId),
      ]);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error", cloudinaryError);
      throw new ApiError(500, "Error while deleting media files");
    }

    const deletedVideo = await Video.findByIdAndDelete(video?._id);

    if (!deletedVideo) {
      throw new ApiError(500, "Error while deleting video on Database");
    }

    return true;
  } catch (error) {
    console.error("Error on deleteVideo", {
      video: video,
      error: error?.stack || error,
    });

    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Failed to deleteVideo"
    );
  }
};
