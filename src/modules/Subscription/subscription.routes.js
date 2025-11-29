import { Router } from "express";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import { viewRateLimiter } from "../../middlewares/rateLimiting.middleware.js";
import {
  channelSubscribeOthersController,
  subscriberCountController,
  subscriptionToggleController,
} from "./subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter
  .route("/subscribe/subscriberCount/:channelId")
  .get(viewRateLimiter, subscriberCountController);

subscriptionRouter
  .route("/subscribe/subscriptionToggle/:channelId")
  .post(JWTVerify, viewRateLimiter, subscriptionToggleController);

subscriptionRouter
  .route("/subscribe/channelSubscribeOthers")
  .get(JWTVerify, viewRateLimiter, channelSubscribeOthersController);

export default subscriptionRouter;
