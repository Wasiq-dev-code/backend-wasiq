import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const register = asyncHandler(async (req, res) => {
  // get user details
  const { username, email, password, fullname } = req.body;
  console.log(email);

  // check the detail is valid?
  if ([username, email, password, fullname].some((val) => val === "")) {
    throw new ApiError(400, "fill all the fields");
  }

  // check is user exist?
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(400, "user already exist");
  }

  // check avatar and cover photo is available?
  const avatar = (await req.files.avatar[0]?.path) || null;
  const coverImg = (await req.files.coverImg[0]?.path) || null;

  if (!avatar) {
    throw new ApiError(409, "avatar is not available");
  }

  // upload both files to cloudinary if exist
  const Avatar = avatar ? await uploadOnCloudinary(avatar) : null;
  const CoverImg = await uploadOnCloudinary(coverImg);

  // create user object-now put entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullname,
    avatar: Avatar.url,
    coverImg: CoverImg?.url || "",
  });

  // check if user not exist in db
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "server issue");
  }

  // return res except password and token
  return res
    .status(200)
    .json(new ApiResponse(201, [createdUser], "sucessful response"));
});
