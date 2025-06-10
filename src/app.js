import "./schedulers/snycViewScheduler.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
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
import router from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

app.use("/api", router);
app.use("/api", videoRouter);

app.use((res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, res) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
