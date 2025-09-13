import { Router } from "express";
import { JWTVerify } from "../../../middlewares/auth.middleware";
import { viewRateLimiter } from "../../../middlewares/rateLimiting.middleware";
import {
  isLikedByUserController,
  toggleLikeContoller,
  totalCommentLikesController,
  totalVideoLikesController,
  likeAddedController,
  likedeleteController,
} from "../Controllers/like.controller.js";

const likeRouter = Router();

// Problem in Adding and Deleteting Routes
likeRouter
  .route("/Like/videoLikeAdded/:videoId")
  .post(JWTVerify, viewRateLimiter, likeAddedController);

likeRouter
  .route("/Like/videoLikedelete/:videoId")
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
