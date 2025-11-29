import { ApiError } from "../../utils/Api/ApiError.js";
import { Like } from "./Likes.model.js";

export const toggleLike = async ({ type, id, userId }) => {
  if (!id || !type) {
    throw new ApiError(400, "Id and type are required");
  }

  if (!["video", "comment"].includes(type)) {
    throw new ApiError(400, "The type can be either 'video' or 'comment'");
  }

  const query = { userliked: userId };

  if (type === "video") query.video = id;
  if (type === "comment") query.comment = id;

  const existing = await Like.findLike(query);

  if (existing) {
    await Like.deleteLikeById(existing._id);
    return { liked: false };
  }

  await Like.createLike(query);
  return { liked: true };
};
