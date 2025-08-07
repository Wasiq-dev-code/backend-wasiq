import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const logoutUser = async (userId) => {
  try {
    if (!userId) {
      throw new ApiError(400, "UserId is not available");
    }
    await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          refreshToken: null,
        },
      },
      {
        new: true,
      }
    );
    return true;
  } catch (error) {
    console.error(
      "Error while executing logoutUser method",
      error?.stack || error
    );
    throw new ApiError(500, "server is down while logout user");
  }
};
