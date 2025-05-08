import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

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
import router from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

app.use("/api", router);
app.use("/api", videoRouter);
export default app;
