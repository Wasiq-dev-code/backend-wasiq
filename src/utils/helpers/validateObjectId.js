import mongoose from "mongoose";
import { ApiError } from "../Api/ApiError.js";

export const validateObjectId = (id, name) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `${name} is not an ObjectId`);
  }
  return new mongoose.Types.ObjectId(id);
};
