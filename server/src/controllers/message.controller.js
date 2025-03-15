import asyncHandler from "../utils/asynchandler.js";
import Message from "../models/message.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Chat from "../models/chat.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


// send message
const sendMessage = asyncHandler(async (req, res) => {
  // get chat id and content

  const { chatId } = req.params;
  const { content } = req.body;
  // console.log(chatId);
  // console.log(content);
  // console.log("req.file", req.file);

  // check if chat id is provided
  if (!chatId) {
    throw new ApiError(400, " chatId is required");
  }

  // check if chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(400, "Chat does not exist");
  }

  // before creating message check what user has send file or text
  let fileSent = req.file ? req.file.path : null;
  let fileUploaded = null;

  if (fileSent) {
    fileUploaded = await uploadOnCloudinary(fileSent);

    if (!fileUploaded || !fileUploaded.secure_url) {
      throw new ApiError(400, "Something went wrong while uploading file");
    }
  }

  // Ensure at least content or file is sent
  if (!content && !fileUploaded) {
    throw new ApiError(400, "Content or file is required");
  }

  // Prepare a message object
  const messageToCreate = {
    sender: req.user._id,
    chat: chatId,
    type: fileUploaded ? "file" : "text",
    content: fileUploaded ? fileUploaded.secure_url : content,
  };

  // now check in these users has initiated the chat or not
  if (chat.hasInitiated.length !== chat.participants.length) {
    const particapntsOtherThanSender = chat.participants
      .filter(
        (participant) => participant.toString() !== req.user._id.toString()
      )
      .filter(
        (participant) => !chat.hasInitiated.includes(participant.toString())
      );

    if (particapntsOtherThanSender.length > 0) {
      chat.hasInitiated.push(...particapntsOtherThanSender);
      await chat.save();
    }
  }

  const message = await Message.create(messageToCreate);

  const messageResponse = await Message.findById(message._id)
    .populate("sender", "name email profilePic")
    .populate({
      path: "chat",
      populate: {
        path: "participants",
        select: "name email profilePic",
      },
    });

  /*now check in these users has initiated the chat or not
   right approch but too many await chat.save()
  for(let user of particapntsOtherThanSender){

      if(!chat.hasInitiated.includes(user)){ 
          chat.hasInitiated.push(user)
          await chat.save()
      }
  }

    wrong approaach 
  check if other user has initiated the chat
  if(!chat.hasInitiated.includes(chat.participants[1]._id)){
      chat.hasInitiated.push(chat.participants[1]._id);
      await chat.save();
  } */

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
  });

  

   res.status(200).json(new ApiResponse(200, messageResponse));
});

// get all messages

const allMessages = asyncHandler(async (req, res) => {
  // get chat id
  const { chatId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // check if chat id is provided
  if (!chatId) {
    throw new ApiError(400, "Chat id is required");
  }

  // check if chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(400, "Chat does not exist");
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name email profilePic")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(200).json(new ApiResponse(200, messages));
});

// when user opens the chat and if there are messages in the chat the mark them as read
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  console.log("chatss", chatId);
  console.log(req.user._id);

  // check if chat id is provided
  if (!chatId) {
    throw new ApiError(400, "Chat id is required");
  }

  // check if chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(400, "Chat does not exist");
  }

  

  // find those messages that are not read and sender is not the current user
  // and push the current user to the readby array
  await Message.updateMany(
    {
      chat: chatId,
      sender: {
        $ne: req.user._id,
      },
      readby: {
        $nin: [req.user._id],
      },
    },
    {
      $push: {
        readby: req.user._id,
      },
    }
  );

  return res.status(200).json(new ApiResponse(200, "Messages marked as read"));
});

const messageController = {
  sendMessage,
  allMessages,
  markMessagesAsRead,
};

export default messageController;
