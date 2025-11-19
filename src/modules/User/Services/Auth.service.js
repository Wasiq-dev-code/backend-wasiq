import jwt from "jsonwebtoken";
import { User } from "../User.model.js";
import { ApiError } from "../../../utils/Api/ApiError.js";
import { uploadOnCloudinary } from "../../../utils/helpers/cloudinary.js";
import { generateAcessAndRefreshAtoken } from "../../../utils/helpers/generatingJWTTokens.js";

// Register a new user
export const resgisterUser = async ({
  username,
  email,
  password,
  fullname,
  files,
}) => {
  // Validate required fields
  if ([username, email, password, fullname].some((val) => val?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if email or username already exists
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Avatar image is required, cover image is optional
  const avatarLocalPath = await files?.avatar?.[0]?.path;
  const coverImgLocalPath = (await files?.coverImg?.[0]?.path) || "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Upload avatar to Cloudinary
  const avatarUpload = await uploadOnCloudinary(avatarLocalPath).catch(
    (err) => {
      console.error("Avatar upload error", err);
    }
  );

  if (!avatarUpload || !avatarUpload.url || !avatarUpload.public_id) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  // Upload cover image if provided (optional)
  let coverImgUpload = null;
  if (coverImgLocalPath) {
    coverImgUpload = await uploadOnCloudinary(coverImgLocalPath).catch(
      (err) => {
        console.error("Cover image upload error", err);
      }
    );
  }

  // Create user entry in the database
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

  if (!user) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  // Fetch user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -avatar_publicId -coverImg_publicId"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  return createdUser;
};

// Login user
export const loginUser = async ({ email, username, password }) => {
  // Validate required fields
  if ([email, username, password].some((val) => val?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Find user by email or username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Compare input password with hashed password
  const passwordChecking = await user.isPasswordCorrect(password);

  if (!passwordChecking) {
    throw new ApiError(401, "Incorrect password");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAcessAndRefreshAtoken(
    user._id
  );

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Failed to generate tokens");
  }

  // Return user info without sensitive data
  const isLoggedIn = await User.findById(user._id).select(
    "-password -refreshToken -avatar_publicId -coverImg_publicId"
  );

  if (!isLoggedIn) {
    throw new ApiError(500, "Unable to fetch user after login");
  }

  return { isLoggedIn, accessToken, refreshToken };
};

// Logout user (delete refresh token from DB)
export const logoutUser = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  return true;
};

// Generate a new access token using refresh token
export const generateAccessToken = async ({ body, cookies }) => {
  const rawRefreshToken = cookies?.refreshToken || body?.refreshToken;

  // Refresh token is mandatory
  if (!rawRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  // Verify refresh token
  const encodedRefreshToken = jwt.verify(
    rawRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // Validate user
  const user = await User.findById(encodedRefreshToken._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent stolen tokens from being used
  if (rawRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Generate new tokens
  const { accessToken, refreshToken } = await generateAcessAndRefreshAtoken(
    user._id
  );

  return { accessToken, refreshToken };
};
