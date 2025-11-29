// import syncScheduler from "./config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { monitorRedis } from "./utils/Cache/checkRedisConnection.js";

const app = express();

// monitorRedis();

app.set("trust proxy", false);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "100kb",
  })
);
app.use(
  express.urlencoded({
    limit: "100kb",
    extended: true,
  })
);

app.use(express.static("public"));
app.use(cookieParser());

// import routes
import router from "./modules/User/user.routes.js";
import videoRouter from ".//modules/Video/video.routes.js";
import likeRouter from "./modules/Like/like.routes.js";
import commentRouter from "./modules/Comment/comment.routes.js";
import subscribeRouter from "./modules/Subscription/subscription.routes.js";

// import BasicAuth from "express-basic-auth";
// import serverAdapter from "./config/bullDashboard.js";
// app.use(
//   "/wasiq/admin/queue",
//   BasicAuth({
//     users: { admin: process.env.BASIC_AUTH_PASSWORD },
//     challenge: true,
//   }),
//   serverAdapter.getRouter()
// );

app.use("/api", router);
app.use("/api", videoRouter);
app.use("/api", subscribeRouter);
app.use("/api", commentRouter);
app.use("/api", likeRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
