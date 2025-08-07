import { User } from "../../models/User.model.js";
import { ApiError } from "../../../utils/ApiError.js";

export const updateFields = async ({ fullname, email }) => {
  try {
    if (!(fullname || email)) {
      throw new ApiError(
        400,
        "please provide at least one field (fullname or email)"
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { fullname, email } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new ApiError(401, "database error");
    }

    return user;
  } catch (error) {
    console.error(
      "Error while executing updateFields method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to updateFields method");
  }
};
