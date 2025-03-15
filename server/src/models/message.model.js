import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },

    type: {
      type: String,
      default: "text",
      enum: ["text", "file"],
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    readby: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;