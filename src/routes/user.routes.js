import { Router } from "express";
import {
  generateAccessToken,
  loginUser,
  logoutUser,
  registerUser,
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

export default router;
