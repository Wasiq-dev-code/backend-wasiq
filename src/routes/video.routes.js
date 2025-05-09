import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { videoUploader } from "../controllers/Video.controller";
import { JWTVerify } from "../middlewares/auth.middleware.js";
const videoRouter = Router();

videoRouter.route("/video/upload-video").post(
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
