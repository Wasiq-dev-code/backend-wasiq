import { Router } from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import { viewRateLimiter } from "../middlewares/rateLimiting.middleware";
import {
  addCommentController,
  deleteCommentController,
  editCommentController,
  getCommentByVideoController,
  getReplyToCommentController,
  myCommentController,
} from "../controllers/comment.controller";

const commentRouter = Router();

commentRouter
  .route("/Comment/addComment/:videoId/:commentId")
  .post(JWTVerify, viewRateLimiter, addCommentController);

commentRouter
  .route("/Comment/deleteComment/:commentId")
  .delete(JWTVerify, viewRateLimiter, deleteCommentController);

commentRouter
  .route("/Comment/getCommentByVideo/:videoId")
  .get(viewRateLimiter, getCommentByVideoController);

commentRouter
  .route("/Comment/getReplyToComment/:commentId")
  .get(viewRateLimiter, getReplyToCommentController);

commentRouter
  .route("/Comment/editComment/:videoId/:commentId")
  .patch(JWTVerify, viewRateLimiter, editCommentController);

commentRouter
  .route("/Comment/myComment")
  .get(JWTVerify, viewRateLimiter, myCommentController);

export default commentRouter;
