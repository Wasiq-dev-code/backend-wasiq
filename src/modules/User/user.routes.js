import { Router } from "express";
import {
  changeAvatarController,
  changeCoverImgController,
  changeCurrentPasswordController,
  generateAccessTokenController,
  getUserChannelProfileController,
  getUserController,
  getUserHistoryController,
  loginUserController,
  logoutUserController,
  registerUserController,
  updateFieldsController,
} from "./user.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import {
  authRateLimiter,
  uploadRateLimiter,
  viewRateLimiter,
} from "../../middlewares/rateLimiting.middleware.js";

const router = Router();

// Authentications Routes
router.route("/user/register").post(
  // uploadRateLimiter,
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
  registerUserController
);

router.route("/user/login").post(authRateLimiter, loginUserController);

router
  .route("/user/refresh-token")
  .post(authRateLimiter, generateAccessTokenController);

router
  .route("/user/logout")
  .post(JWTVerify, authRateLimiter, logoutUserController);

// Profile Routes
router
  .route("/user/change-password")
  .post(JWTVerify, authRateLimiter, changeCurrentPasswordController);

router
  .route("/user/get-user")
  .get(JWTVerify, authRateLimiter, getUserController);

router
  .route("/user/update-fields")
  .patch(JWTVerify, uploadRateLimiter, updateFieldsController);

router
  .route("/user/change-avatar")
  .patch(
    JWTVerify,
    uploadRateLimiter,
    upload.single("avatar"),
    changeAvatarController
  );

router
  .route("/user/change-coverImg")
  .patch(
    JWTVerify,
    uploadRateLimiter,
    upload.single("coverImg"),
    changeCoverImgController
  );

router
  .route("/user/channel-profile/:username")
  .get(JWTVerify, viewRateLimiter, getUserChannelProfileController);

router
  .route("/user/history")
  .get(JWTVerify, viewRateLimiter, getUserHistoryController);

export default router;
