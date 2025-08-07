import mongoose from "mongoose";
import { dbName } from "../constants.js";

const connectMongo = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${dbName}`
    );
    console.log("MongoDB connected:", connectionInstance.connection.host);
  } catch (error) {
    console.log("Error while connecting to DB:", error);
    process.exit(1);
  }
};

export default connectMongo;
