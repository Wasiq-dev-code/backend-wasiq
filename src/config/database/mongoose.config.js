/**
 * @file mongoose.config.js
 * @description
 * Handles the mongo db connection to this project. it establishes a persistent connection to the specified database. Logs connection status and handle errors effectively
 *
 * This Fucntion:
 * Connects to MongoDB using the `MONGO_URI` environment variable.
 * Uses the database name from the `dbName` constant.
 * Logs a success message on successful connection.
 * Logs and exits the process if any connection error occurs.
 *
 * @function connectMongo
 * @returns {Promise<void>} Resolves when the connection is established successfully.
 * @throws {Error} Terminates the process if unable to connect to MongoDB.
 *
 * @example
 * import connectMongo from "./db/connectMongo.js";
 *
 * (async () => {
 *   await connectMongo();
 *   // Continue with server startup after successful DB connection
 * })();
 */

import mongoose from "mongoose";
import { dbName } from "../../constants.js";

const connectMongo = async () => {
  try {
    console.log(">>> Railway ENV MONGODB_URI =", process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${dbName}`
    );
    if (connectionInstance?.connection?.host) {
      console.log("MongoDB connected:", connectionInstance.connection.host);
    }
  } catch (error) {
    console.log("Error while connecting to DB:", error);
    process.exit(1);
  }
};

export default connectMongo;
