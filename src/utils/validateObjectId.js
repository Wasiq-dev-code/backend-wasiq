import mongoose from "mongoose";
import { ApiError } from "./ApiError";

export const validateObjectId = (id, name) => {
  if (!mongoose.Types.ObjectId(id)) {
    throw new ApiError(400, `${name} is not an ObjectId`);
  }
};
