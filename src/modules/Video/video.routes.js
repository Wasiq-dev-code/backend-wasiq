import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import {
  deleteVideoController,
  getAllMyVideosController,
  getAllVideosController,
  getVideoByIdController,
  updateVideoController,
  videoUploaderController,
} from "./Video.controller.js";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import {
  viewRateLimiter,
  uploadRateLimiter,
} from "../../middlewares/rateLimiting.middleware.js";
import { verifyVideo } from "../../middlewares/videoSecurity.middleware.js";
// import cacheMiddleware from "../../middlewares/cache.middleware.js";
// import trackVideoView from "../../middlewares/trackIncreaseViews.middleware.js";

const videoRouter = Router();

/// Public Routes
videoRouter.route("/videos").get(
  viewRateLimiter,
  // cacheMiddleware("videosList", process.env.CACHE_DURATIONS_VIDEO_LIST, {
  //   bypassHeader: "x-bypass-cache",
  //   compressData: false,
  // }),
  getAllVideosController
);

videoRouter
  .route("/video/myvideos")
  .get(JWTVerify, viewRateLimiter, getAllMyVideosController);

videoRouter.route("/video/:videoId").get(
  viewRateLimiter,
  // trackVideoView,
  // cacheMiddleware("Video", process.env.CACHE_DURATIONS_VIDEO, {
  //   bypassHeader: "x-bypass-cache",
  //   compressData: false,
  // }),
  getVideoByIdController
);

/// Secure Routes

videoRouter.route("/video/upload").post(
  JWTVerify,
  uploadRateLimiter,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoUploaderController
);

videoRouter
  .route("/video/delete/:videoId")
  .delete(JWTVerify, verifyVideo, uploadRateLimiter, deleteVideoController);

videoRouter
  .route("/video/update/:videoId")
  .patch(
    JWTVerify,
    verifyVideo,
    uploadRateLimiter,
    upload.single("thumbnail"),
    updateVideoController
  );

export default videoRouter;
