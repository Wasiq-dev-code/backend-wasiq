import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  videoUploader,
} from "../controllers/Video.controller";
import { JWTVerify } from "../middlewares/auth.middleware.js";
import {
  uploadRateLimiter,
  viewRateLimiter,
} from "../middlewares/rateLimiting.middleware.js";
import { verifyVideo } from "../middlewares/videoSecurity.middleware.js";

const videoRouter = Router();

/// Public Routes
videoRouter.route("/").get(viewRateLimiter, getAllVideos);
videoRouter.route("/c/:videoId").get(viewRateLimiter, getVideoById);

/// Secure Routes
videoRouter.route("/video/upload").post(
  JWTVerify,
  uploadRateLimiter,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoUploader
);

videoRouter
  .route("/video/delete/:videoId")
  .delete(JWTVerify, verifyVideo, deleteVideo);

videoRouter
  .route("/video/update/:videoId")
  .patch(JWTVerify, verifyVideo, upload.single("thumbnail"), updateVideo);

export default videoRouter;
