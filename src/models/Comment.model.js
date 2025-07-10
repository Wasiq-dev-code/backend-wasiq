import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    commentedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentedvideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parentcomment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
