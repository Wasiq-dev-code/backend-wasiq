import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: false,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: false,
    },
    userliked: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.index({ userliked: 1, video: 1 }, { unique: true, sparse: true });
likeSchema.index({ userliked: 1, comment: 1 }, { unique: true, sparse: true });

likeSchema.pre("validate", function (next) {
  if (this.video && this.comment) {
    next(
      new Error(
        "Like can be associated with either a video or a comment, not both"
      )
    );
  } else {
    next();
  }
});

likeSchema.statics.isLiked = async function (videoId, commentId, userId) {
  if (!videoId && !commentId) {
    throw new Error("Either videoId or commentId must be provided");
  }

  const query = { userliked: userId };
  if (videoId) query.video = videoId;
  if (commentId) query.comment = commentId;

  return await this.exists(query);
};

likeSchema.statics.createLike = async function (videoId, commentId, userId) {
  if (!videoId && !commentId) {
    throw new Error("Either videoId or commentId must be provided");
  }

  const newLike = await this.create({
    userliked: userId,
    ...(videoId && { video: videoId }),
    ...(commentId && { comment: commentId }),
  });

  return newLike;
};

likeSchema.statics.deleteLike = async function (videoId, commentId, userId) {
  if (!videoId && !commentId) {
    throw new Error("Either videoId or commentId must be provided");
  }

  await this.deleteOne({
    userliked: userId,
    ...(videoId && { video: videoId }),
    ...(commentId && { video: commentId }),
  });
};

likeSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Like = mongoose.model("Like", likeSchema);
