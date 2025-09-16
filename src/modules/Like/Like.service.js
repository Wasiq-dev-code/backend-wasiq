import { ApiError } from "../../utils/Api/ApiError.js";
import { Like } from "./Likes.model.js";
import { validateObjectId } from "../../utils/helpers/validateObjectId.js";

export const likeAdded = async ({ videoId, userId, commentId }) => {
  try {
    if (!videoId && !commentId) {
      throw new ApiError(400, "Videoid or Commentid should available");
    }

    if (!userId) {
      throw new ApiError(400, "Unauthorized Req");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    const liked = await Like.createLike(videoId, commentId, userId);

    if (!liked) {
      throw new ApiError(500, "Like is not added");
    }

    return true;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Server contain error at likeAdded service");
  }
};

export const likeDelete = async ({ userId, videoId, commentId }) => {
  try {
    if (!videoId && !commentId) {
      throw new ApiError(400, "Videoid or Commentid should available");
    }

    if (!userId) {
      throw new ApiError(400, "Unauthorized Req");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    await Like.deletedLike(videoId, commentId, userId);

    return true;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Server contain error at likeAdded service");
  }
};

export const isLikeByUser = async ({ videoId, commentId, userId }) => {
  try {
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!videoId && !commentId) {
      throw new ApiError(401, "Error in params");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    const LikePresented = await Like.isLiked(videoId, commentId, userId);

    return LikePresented;
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
};

export const totalCommentLikes = async ({ commentId }) => {
  try {
    if (!commentId) {
      throw new ApiError(400, "Comment ID is required");
    }

    validateObjectId(commentId, "Comment ID");

    const likeCount = await Like.countDocuments({ comment: commentId });

    return likeCount;
  } catch (error) {
    console.error(error.message || "Error in totalCommentLikes");
    throw new ApiError(500, "Server error while counting comment likes");
  }
};

export const totalVideoLikes = async ({ videoId }) => {
  try {
    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }

    validateObjectId(videoId, "Video ID");

    const likeCount = await Like.countDocuments({ video: videoId });

    return likeCount;
  } catch (error) {
    console.error(error.message || "Error in totalVideoLikes");
    throw new ApiError(500, "Server error while counting Video likes");
  }
};

export const toggleLike = async ({ videoId, commentId, userId }) => {
  try {
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!videoId && !commentId) {
      throw new ApiError(401, "Error in params");
    }

    if (videoId) validateObjectId(videoId, "Video ID");
    if (commentId) validateObjectId(commentId, "Comment ID");

    const LikePresented = await Like.isLiked(videoId, commentId, userId);

    !LikePresented
      ? await Like.create(...query)
      : await Like.findByIdAndDelete(...query);

    return true;
  } catch (error) {
    console.error(error.message || "server is not responding");
    throw new ApiError(500, "server is not responding");
  }
};
