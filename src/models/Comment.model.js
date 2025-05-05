import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    commentedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    commentedvideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    content: {
      type: String,
    },
    parentcomment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
