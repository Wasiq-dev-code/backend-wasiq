import { toggleLike } from "./Like.service.js";
import { ApiResponse } from "../../utils/Api/ApiResponse.js";
import { asyncHandler } from "../../utils/helpers/asyncHandler.js";

const toggleLikeController = asyncHandler(async (req, res) => {
  const { type, id } = req.body;
  const userId = req.user._id;

  const result = await toggleLike({ type, id, userId });

  res
    .status(200)
    .json(new ApiResponse(200, result, result.liked ? "Liked" : "Unliked"));
});

export { toggleLikeController };
