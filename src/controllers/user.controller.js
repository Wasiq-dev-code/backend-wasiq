import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAcessAndRefreshAtoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(500, "error while creating tokens");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong", error);
  }
};

export const register = asyncHandler(async (req, res) => {
  // console.log("req.files", req.files || req.files);
  // get user details
  const { username, email, password, fullname } = req.body;

  // check the detail is valid?
  if ([username, email, password, fullname].some((val) => val?.trim() === "")) {
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

  const avatarLocalPath = await req.files?.avatar[0]?.path;
  const coverImgLocalPath = req.files?.coverImg?.[0]?.path || "";

  if (!avatarLocalPath) {
    throw new ApiError(409, "avatar is not available");
  }

  // upload both files to cloudinary if exist

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  // console.log("avatarUpload", avatarUpload);

  if (!avatarUpload || !avatarUpload.url) {
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
    coverImg: coverImgUpload?.url || "",
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
    .json(new ApiResponse(201, createdUser, "sucessful response"));
});

export const Login = asyncHandler(async (req, res) => {
  // take data through req.body
  // check username or email exist?
  // check password is same or not
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new ApiError(401, "fill your given fields");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(400, "user is not available");
  }

  const passwordChecking = await user.isPasswordCorrect(password);

  if (!passwordChecking) {
    throw new ApiError(400, "password is not correct");
  }

  const { accessToken, refreshToken } = await generateAcessAndRefreshAtoken(
    user._id
  );

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "error while fetching tokens");
  }
  // returning current object values accept password and refreshtoken
  const isLoggedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!isLoggedIn) throw new ApiError(500, "Api not found");

  // adding cookies
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          isLoggedIn,
          accessToken,
          refreshToken,
        },
        "successfull login user"
      )
    );
});
