import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: function (value) {
          return value.toString() !== this.subscriber.toString();
        },
        message: "User cannot subscribe to themselves",
      },
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

subscriptionSchema.static.isSubscribed = async function (
  subscriberId,
  channelId
) {
  return await this.exists({ subscriber: subscriberId, channel: channelId });
};

subscriptionSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
