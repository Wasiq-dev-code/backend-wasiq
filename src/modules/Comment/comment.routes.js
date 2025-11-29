import { Router } from "express";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import { viewRateLimiter } from "../../middlewares/rateLimiting.middleware.js";
import {
  addCommentController,
  deleteCommentController,
  getCommentsOfVideoController,
} from "./comment.controller.js";

const commentRouter = Router();
// /:commentId
commentRouter
  .route("/Comment/addComment/:videoId")
  .post(JWTVerify, viewRateLimiter, addCommentController);

commentRouter
  .route("/Comment/addComment/:videoId/:commentId")
  .post(JWTVerify, viewRateLimiter, addCommentController);

commentRouter
  .route("/Comment/deleteComment/:commentId")
  .delete(JWTVerify, viewRateLimiter, deleteCommentController);

commentRouter
  .route("/Comment/getCommentsOfVideo/:videoId")
  .get(viewRateLimiter, getCommentsOfVideoController);

export default commentRouter;
