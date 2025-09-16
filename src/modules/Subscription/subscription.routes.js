import { Router } from "express";
import { JWTVerify } from "../../middlewares/auth.middleware.js";
import { verifyVideo } from "../../middlewares/videoSecurity.middleware.js";
import { viewRateLimiter } from "../../middlewares/rateLimiting.middleware.js";
import {
  addSubscriptionToChannelController,
  channelSubscribeOthersController,
  checkSubscriptionStatusController,
  removeSubscriptionFromChannelController,
  subscriberCountController,
  subscriptionToggleController,
} from "./subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter
  .route("/subscribe/addSubscriptionToChannel/:channelId")
  .post(JWTVerify, viewRateLimiter, addSubscriptionToChannelController);
subscriptionRouter
  .route("/subscribe/removeSubscriptionFromChannel/:channelId")
  .delete(JWTVerify, viewRateLimiter, removeSubscriptionFromChannelController);

subscriptionRouter
  .route("/subscribe/subscriberCount/:channelId")
  .get(viewRateLimiter, subscriberCountController);

subscriptionRouter
  .route("/subscribe/checkSubscriptionStatus/:channelId")
  .get(JWTVerify, viewRateLimiter, checkSubscriptionStatusController);

subscriptionRouter
  .route("/subscribe/subscriptionToggle/:channelId")
  .get(JWTVerify, viewRateLimiter, subscriptionToggleController);

subscriptionRouter
  .route("/subscribe/channelSubscribeOthers")
  .get(JWTVerify, viewRateLimiter, channelSubscribeOthersController);

// channelId

export default subscriptionRouter;
