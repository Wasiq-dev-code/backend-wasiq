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

const router = Router();

router.route("/user/register").post(
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

router.route("/user/login").post(loginUser);

// secure routes
router.route("/user/logout").post(JWTVerify, logoutUser);
router.route("/user/refresh-token").post(generateAccessToken);
router.route("/user/change-password").post(JWTVerify, changeCurrentPassword);
router.route("/user/get-user").get(JWTVerify, getUser);
router.route("/user/update-fields").patch(JWTVerify, updateFields);
router
  .route("/user/change-avatar")
  .patch(JWTVerify, upload.single("avatar"), changeAvatar);
router
  .route("/user/change-coverImg")
  .patch(JWTVerify, upload.single("coverImg"), changeCoverImg);
router
  .route("/user/channel-profile/:username")
  .get(JWTVerify, getUserChannelProfile);

router.route("/user/history").get(JWTVerify, getUserHistory);

export default router;
