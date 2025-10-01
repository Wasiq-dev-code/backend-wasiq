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
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ commentedvideo: 1, parentcomment: 1 });
commentSchema.index({ parentcomment: 1 });
commentSchema.index({ commentedby: 1 });

commentSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Comment = mongoose.model("Comment", commentSchema);
