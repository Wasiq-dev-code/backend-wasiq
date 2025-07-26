import { Router } from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import { viewRateLimiter } from "../middlewares/rateLimiting.middleware";
import {
  commentLikeAddedController,
  commentLikedeleteController,
  isLikedByUserController,
  toggleLikeContoller,
  totalCommentLikesController,
  totalVideoLikesController,
  videoLikeAddedController,
  videoLikedeleteController,
} from "../controllers/like.controller";

const likeRouter = Router();

likeRouter
  .route("/Like/videoLikeAdded/:videoId")
  .post(JWTVerify, viewRateLimiter, videoLikeAddedController);

likeRouter
  .route("/Like/videoLikedelete/:videoId")
  .delete(JWTVerify, viewRateLimiter, videoLikedeleteController);

likeRouter
  .route("/Like/isLikedByUser/:videoId/:commentId ")
  .get(JWTVerify, viewRateLimiter, isLikedByUserController);

likeRouter
  .route("/Like/totalCommentLikes")
  .get(viewRateLimiter, totalCommentLikesController);

likeRouter
  .route("/Like/totalVideoLikes")
  .get(viewRateLimiter, totalVideoLikesController);

likeRouter
  .route("/Like/toggleLike/:videoId/:commentId")
  .get(JWTVerify, viewRateLimiter, toggleLikeContoller);

export default likeRouter;
