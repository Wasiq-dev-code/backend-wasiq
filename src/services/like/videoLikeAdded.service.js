import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/Likes.model.js";

export const likeAdded = async (commentID, UserID) => {
  try {
    if (!commentID) {
      throw new ApiError(
        400,
        "Data has containing error from likeAddedContr0ller"
      );
    }

    if (!UserID) {
      throw new ApiError(
        400,
        "User has containing error from likeAddedContr0ller"
      );
    }

    const safecommentID = commentID
      ? mongoose.Types.ObjectId(commentID)
      : undefined;

    const liked = await Like.create({
      comment: safecommentID,
      userliked: UserID,
    });

    if (!liked) {
      throw new ApiError(500, "Error Occured while establishing Liked Schema ");
    }

    return true;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Server contain error at likeAdded service");
  }
};
