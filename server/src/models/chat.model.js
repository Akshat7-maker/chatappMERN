import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    groupName: {
      type: String,
      default: "",
    },
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    hasInitiated: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
