// loadEnv.js

import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

console.log("✅ Environment variables loaded");
