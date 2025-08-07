import { Comment } from "../../models/Comment.model";
import { ApiError } from "../../utils/ApiError";
import { validateObjectId } from "../../utils/validateObjectId";

export const myComment = async ({ userId }) => {
  try {
    if (!userId) throw new ApiError(401, "Unauthorized Request");

    validateObjectId(userId, "userId");

    const myCommentList = await Comment.find({ commentedby: userId });

    if (!myCommentList) throw new ApiError(404, "Comments not found");

    return myCommentList;
  } catch (error) {
    console.error(error, "server is not responding");
  }
};
