import app from "./app.js";
import connectMongo from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 3000;

connectMongo()
  .then(() => {
    app.on("error", (err) => {
      console.error("Error while starting the server:", err);
      process.exit(1);
    });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting to Mongo:", err);
    process.exit(1); // good practice to exit if DB fails
  });
