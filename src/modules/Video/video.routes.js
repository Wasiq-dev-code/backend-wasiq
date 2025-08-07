import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import {
  deleteVideoController,
  getAllVideosController,
  getVideoByIdController,
  updateVideoController,
  videoUploaderController,
} from "../controllers/Video.controller.js";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import { viewRateLimiter } from "../../middlewares/rateLimiting.middleware.js";
import { verifyVideo } from "../../middlewares/videoSecurity.middleware.js";
import cacheMiddleware from "../../middlewares/cache.middleware.js";
import trackVideoView from "../../middlewares/increaseViews.middleware.js";

const videoRouter = Router();

/// Public Routes
videoRouter.route("/Videos").get(
  viewRateLimiter,
  cacheMiddleware("videosList", process.env.CACHE_DURATIONS_VIDEO_LIST, {
    bypassHeader: "x-bypass-cache",
    compressData: false,
  }),
  getAllVideosController
);
videoRouter.route("/Video/:videoId").get(
  viewRateLimiter,
  trackVideoView,
  cacheMiddleware("Video", process.env.CACHE_DURATIONS_VIDEO, {
    bypassHeader: "x-bypass-cache",
    compressData: false,
  }),
  getVideoByIdController
);

/// Secure Routes
videoRouter.route("/video/upload").post(
  JWTVerify,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoUploaderController
);

videoRouter
  .route("/video/delete/:videoId")
  .delete(JWTVerify, verifyVideo, deleteVideoController);

videoRouter
  .route("/video/update/:videoId")
  .patch(
    JWTVerify,
    verifyVideo,
    upload.single("thumbnail"),
    updateVideoController
  );

export default videoRouter;
