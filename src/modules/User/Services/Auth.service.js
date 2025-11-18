import jwt from "jsonwebtoken";
import { User } from "../User.model.js";
import { ApiError } from "../../../utils/Api/ApiError.js";
import { uploadOnCloudinary } from "../../../utils/helpers/cloudinary.js";
import { generateAcessAndRefreshAtoken } from "../../../utils/helpers/generatingJWTTokens.js";

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

    const avatarUpload = await uploadOnCloudinary(avatarLocalPath).catch(
      (err) => {
        console.error("Avatar upload error", err);
      }
    );
    // console.log("avatarUpload", avatarUpload);

    if (!avatarUpload || !avatarUpload.url || !avatarUpload.public_id) {
      throw new ApiError(400, "avatar upload failed");
    }

    // optional coverIMG
    let coverImgUpload = null;
    if (coverImgLocalPath) {
      coverImgUpload = await uploadOnCloudinary(coverImgLocalPath).catch(
        (err) => {
          console.error("Coverimg error", err);
        }
      );
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
      "-_id -password -refreshToken -avatar_publicId -coverImg_publicId"
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

export const loginUser = async ({ email, username, password }) => {
  try {
    if ([email, username, password].some((val) => val?.trim() === "")) {
      throw new ApiError(400, "please fill all required fields");
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
      "-_id -password -refreshToken -avatar_publicId -coverImg_publicId"
    );

    if (!isLoggedIn) throw new ApiError(500, "Api not found");

    return { isLoggedIn, accessToken, refreshToken };
  } catch (error) {
    console.error(
      "Error while executing loginUser method",
      error?.stack || error
    );
    throw new ApiError(500, "server is down while login user");
  }
};

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

export const generateAccessToken = async ({ body, cookies }) => {
  try {
    const rawRefreshToken = cookies?.refreshToken || body?.refreshToken;

    if (!rawRefreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    const encodedRefreshToken = jwt.verify(
      rawRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(encodedRefreshToken._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (rawRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token mismatch");
    }

    const { accessToken, newRefreshToken } =
      await generateAcessAndRefreshAtoken(user._id);

    return { accessToken, newRefreshToken };
  } catch (error) {
    console.error(
      "Error while executing generateAccessToken method",
      error?.stack || error
    );
    throw new ApiError(500, "Server is down due to generateAccessToken method");
  }
};
