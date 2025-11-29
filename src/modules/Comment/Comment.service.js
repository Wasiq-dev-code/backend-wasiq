import { Comment } from "./Comment.model.js";
import { ApiError } from "../../utils/Api/ApiError.js";
import { validateObjectId } from "../../utils/helpers/validateObjectId.js";
import mongoose from "mongoose";

export const addComment = async ({ videoId, userId, content, commentId }) => {
  if (!userId) throw new ApiError(401, "Unauthorized request");
  if (!content?.trim())
    throw new ApiError(400, "Comment content cannot be empty");
  if (!videoId) throw new ApiError(400, "Video ID is required");

  validateObjectId(videoId, "Video ID");
  validateObjectId(userId, "User ID");

  const query = {
    content: content.trim(),
    commentedvideo: videoId,
    commentedby: userId,
  };

  // If it's a reply
  if (commentId) {
    validateObjectId(commentId, "Comment ID");

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    if (parentComment.commentedvideo.toString() !== videoId) {
      throw new ApiError(
        400,
        "Parent comment does not belong to the same video"
      );
    }

    query.parentcomment = commentId;
  }

  const newComment = await Comment.create(query);

  if (!newComment) {
    throw new ApiError(500, "Failed to create comment");
  }

  return newComment;
};

export const deleteComment = async ({ commentId, userId }) => {
  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!commentId) throw new ApiError(400, "Comment ID is required");

  validateObjectId(commentId, "Comment ID");
  validateObjectId(userId, "User ID");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.commentedby.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not an owner of this comment");
  }

  await Promise.all([
    comment.deleteOne(),
    Comment.deleteMany({
      parentcomment: commentId,
    }),
  ]);

  return true;
};

export const getCommentsOfVideo = async ({ videoId }) => {
  if (!videoId) throw new ApiError(401, "videoId is not available");

  validateObjectId(videoId, "videoId");

  const comments = Comment.aggregate([
    {
      $match: {
        commentedvideo: new mongoose.Types.ObjectId(videoId),
        parentcomment: null,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "commentedby",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$comment", "$$commentId"],
              },
            },
          },
          { $count: "count" },
        ],
        as: "likes",
      },
    },

    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        likes: {
          $ifNull: [{ $first: "$likes.count" }, 0],
        },
      },
    },

    {
      $lookup: {
        from: "comments",
        let: { parentId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$parentcomment", "$$parentId"] } } },

          {
            $lookup: {
              from: "users",
              localField: "commentedby",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          {
            $lookup: {
              from: "likes",
              let: { replyId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$comment", "$$replyId"] } } },
                { $count: "count" },
              ],
              as: "likes",
            },
          },

          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
              likes: {
                $ifNull: [{ $first: "$likes.count" }, 0],
              },
            },
          },

          { $limit: 3 },
        ],
        as: "replies",
      },
    },
  ]);
  if (!comments) throw new ApiError(404, "Comments not found");

  return comments;
};
