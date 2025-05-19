import { User } from "../../models/User.model";
import { ApiError } from "../../utils/ApiError";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const resgisterUser = async ({
  username,
  email,
  password,
  fullname,
  files,
}) => {
  try {
    if (
      [username, email, password, fullname].some((val) => val?.trim() === "")
    ) {
      throw new ApiError(400, "fill all the fields");
    }

    const existedUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existedUser) {
      throw new ApiError(400, "user already exist");
    }

    // check avatar and cover photo is available?

    const avatarLocalPath = await files?.avatar[0]?.path;
    const coverImgLocalPath = (await files?.coverImg?.[0]?.path) || "";

    if (!avatarLocalPath) {
      throw new ApiError(409, "avatar is not available");
    }

    // upload both files to cloudinary if exist

    const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
    // console.log("avatarUpload", avatarUpload);

    if (!avatarUpload || !avatarUpload.url || !avatarUpload.public_id) {
      throw new ApiError(400, "avatar upload failed");
    }

    // optional coverIMG
    let coverImgUpload = null;
    if (coverImgLocalPath) {
      coverImgUpload = await uploadOnCloudinary(coverImgLocalPath);
    }

    // create user object-now put entry in db
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullname,
      avatar: avatarUpload.url,
      avatar_publicId: avatarUpload.public_id,
      coverImg: coverImgUpload?.url || "",
      coverImg_publicId: coverImgUpload?.public_id || "",
    });

    if (!user) throw new ApiError(500, "server issue");

    // check if user not exist in db
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "server issue");
    }

    return createdUser;
  } catch (error) {
    console.error(
      "Error while executing registerUser method",
      error?.stack || error
    );
    throw new ApiError(500, "server is down while creating user");
  }
};
