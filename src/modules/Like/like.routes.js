import { Router } from "express";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import { toggleLikeController } from "./like.controller.js";

const likeRouter = Router();

likeRouter.route("/like").post(JWTVerify, toggleLikeController);

export default likeRouter;
