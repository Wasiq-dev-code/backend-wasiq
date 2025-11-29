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

likeSchema.statics.findLike = function (query) {
  return this.findOne(query);
};

likeSchema.statics.createLike = function (payload) {
  return this.create(payload);
};

likeSchema.statics.deleteLikeById = function (id) {
  return this.findByIdAndDelete(id);
};

likeSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Like = mongoose.model("Like", likeSchema);

// likeSchema.statics.isLiked = async function (videoId, commentId, userId) {
//   if (!videoId && !commentId) {
//     throw new Error("Either videoId or commentId must be provided");
//   }

//   const query = { userliked: userId };
//   if (videoId) query.video = videoId;
//   if (commentId) query.comment = commentId;

//   return await this.exists(query);
// };

// likeSchema.statics.createLike = async function (videoId, commentId, userId) {
//   if (!videoId && !commentId) {
//     throw new Error("Either videoId or commentId must be provided");
//   }

//   const newLike = await this.create({
//     userliked: userId,
//     ...(videoId && { video: new mongoose.Types.ObjectId(videoId) }),
//     ...(commentId && { comment: new mongoose.Types.ObjectId(commentId) }),
//   });

//   return newLike;
// };

// likeSchema.statics.deleteLike = async function (videoId, commentId, userId) {
//   if (!userId) throw new Error("Unauthorized");
//   if (!videoId && !commentId) throw new Error("videoId or commentId missing");

//   const query = {
//     userliked: userId,
//     ...(videoId && { video: videoId }),
//     ...(commentId && { comment: commentId }),
//   };

//   const existing = await this.findOne(query);
//   if (!existing) {
//     throw new Error("You cannot unlike because you didn't like this before");
//   }

//   await existing.deleteOne();
//   return true;
// };
