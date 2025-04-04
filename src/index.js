import app from "./app.js";
import connectMongo from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 3000;

app.on("error", (err) => {
  console.log("Error while starting the server", err);
  process.exit(1);
});

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("err while connecting mongo", err);
    throw err;
  });
