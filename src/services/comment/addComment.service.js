import { Comment } from "../../models/Comment.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

export const addComment = async (properties) => {
  try {
    if (!properties.userID) {
      throw new ApiError(400, "Unauthorized request");
    }

    if (!properties.content.trim()) {
      throw new ApiError("content does not trim");
    }

    if (!properties.videoID) {
      throw new ApiError(400, "Video id does not found in the params");
    }

    validateObjectId(properties.userID, "User Id");
    validateObjectId(properties.videoId, "Video Id");

    const query = {
      commentedby: properties.userID,
      commentedvideo: properties.videoID,
      content: properties.content,
    };

    if (properties.commentID) {
      validateObjectId(properties.commentID, "comment Id");
      query.parentcomment = properties.commentID;
    }

    const commented = await Comment.create(query);

    if (!commented) {
      throw new ApiError(500, "Commented Operation Failed");
    }
    return commented;
  } catch (error) {
    console.error(error, "server has error");
    throw new ApiError(500, "Server occured error");
  }
};
