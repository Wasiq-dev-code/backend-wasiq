import { Router } from "express";
import {
  changeAvatar,
  changeCoverImg,
  changeCurrentPassword,
  generateAccessToken,
  getUser,
  getUserChannelProfile,
  getUserHistory,
  loginUser,
  logoutUser,
  registerUser,
  updateFields,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";
import {
  authRateLimiter,
  uploadRateLimiter,
  viewRateLimiter,
} from "../middlewares/rateLimiting.middleware.js";

const router = Router();

// PUBLIC ROUTES
router.route("/user/register").post(
  uploadRateLimiter,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImg",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/user/login").post(authRateLimiter, loginUser);
router.route("/user/refresh-token").post(authRateLimiter, generateAccessToken);

// PROTECTED ROUTES
router.route("/user/logout").post(JWTVerify, authRateLimiter, logoutUser);
router
  .route("/user/change-password")
  .post(JWTVerify, authRateLimiter, changeCurrentPassword);
router.route("/user/get-user").get(JWTVerify, authRateLimiter, getUser);
router
  .route("/user/update-fields")
  .patch(JWTVerify, uploadRateLimiter, updateFields);
router
  .route("/user/change-avatar")
  .patch(JWTVerify, uploadRateLimiter, upload.single("avatar"), changeAvatar);
router
  .route("/user/change-coverImg")
  .patch(
    JWTVerify,
    uploadRateLimiter,
    upload.single("coverImg"),
    changeCoverImg
  );

//PRTECTED CHANEEL AND HISTORY ROUTES
router
  .route("/user/channel-profile/:username")
  .get(JWTVerify, viewRateLimiter, getUserChannelProfile);
s;

router.route("/user/history").get(JWTVerify, viewRateLimiter, getUserHistory);

export default router;
