import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const changeCurrentPassword = async ({
  user,
  oldPassword,
  newPassword,
}) => {
  try {
    if (!user) {
      throw new ApiError(401, "Unauthorized REQ");
    }

    if (!oldPassword || !newPassword) {
      throw new ApiError(401, "fill all the fields");
    }

    const userObject = await User.findById(user?._id);

    if (!userObject) {
      throw new ApiError(500, "database error");
    }

    const checkedPassword = await userObject.isPasswordCorrect(oldPassword);

    if (!checkedPassword) {
      throw new ApiError(401, "your old password is not matched");
    }

    userObject.password = newPassword;
    await userObject.save({ validateBeforeSave: false });

    return true;
  } catch (error) {
    console.error(
      "Error while executing changeCurrentPassword method",
      error?.stack || error
    );
    throw new ApiError(
      500,
      "Server is down due to changeCurrentPassword method"
    );
  }
};
