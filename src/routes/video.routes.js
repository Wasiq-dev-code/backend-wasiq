import { Router } from "express";
import { upload } from "../utils/cloudinary.js";
import { videoUploader } from "../controllers/Video.controller";
const videoRouter = Router();

videoRouter.route("/video/upload-video").post(
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
