import { Router } from "express";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import { viewRateLimiter } from "../../middlewares/rateLimiting.middleware.js";
import {
  isLikedByUserController,
  toggleLikeContoller,
  totalCommentLikesController,
  totalVideoLikesController,
  likeAddedController,
  likedeleteController,
} from "./like.controller.js";

const likeRouter = Router();

// Problem in Adding and Deleteting Routes
likeRouter
  .route("/Like/video/:videoId")
  .post(JWTVerify, viewRateLimiter, likeAddedController);

likeRouter
  .route("/Like/comment/:commentId")
  .post(JWTVerify, viewRateLimiter, likeAddedController);

likeRouter
  .route("/Like/video/:videoId")
  .delete(JWTVerify, viewRateLimiter, likedeleteController);

likeRouter
  .route("/Like/comment/:commentId")
  .delete(JWTVerify, viewRateLimiter, likedeleteController);

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
