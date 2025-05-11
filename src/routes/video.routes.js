import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllVideos, videoUploader } from "../controllers/Video.controller";
import { JWTVerify } from "../middlewares/auth.middleware.js";
const videoRouter = Router();

/// Public Routes
videoRouter.route("/").get(getAllVideos);

/// Secure Routes
videoRouter.route("/video/upload").post(
  JWTVerify,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  videoUploader
);

export default videoRouter;
