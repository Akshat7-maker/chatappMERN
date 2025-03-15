import Chat from "../models/chat.model.js";
import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// create chat
const createChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  // console.log(userId)

  // if userId is not provided
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  // check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  // ********************* this approach can issue creating a duplicate chats
  //  when both users try to do same thing at one time **************

  // // check if chat already exists
  // const chat = await Chat.findOne({
  //   isGroupChat: false,
  //   participants: {
  //     $all: [req.user._id, userId],
  //   },
  // })
  //   .populate("participants", "name email profilePic")
  //   .populate("latestMessage");

  // // if chat exists
  // if (chat) {
  //   // if chat exists update hasInitiated
  //   if (!chat.hasInitiated.includes(req.user._id)) {
  //     chat.hasInitiated.push(req.user._id);
  //     await chat.save();
  //   }
  //   return res.status(200).json(new ApiResponse(200, chat));
  // }

  // // if chat does not exist create chat
  // const newChat = await Chat.create({
  //   participants: [req.user._id, userId],
  //   isGroupChat: false,
  //   hasInitiated: [req.user._id],
  // });
  // await newChat.populate("participants", "name email profilePic");
  // return res.status(200).json(new ApiResponse(200, newChat));


  // *********************************************


  console.log("hi")

  // use transcations 

  // start a session for a transaction
  const session = await mongoose.startSession();

  try {
      session.startTransaction();
  
      let chat = await Chat.findOne({
          isGroupChat: false,
          participants: { $all: [req.user._id, userId] }
      }).session(session);
  
      if (!chat) {
          // **Recheck before inserting** to prevent duplicate creation in parallel transactions
          chat = await Chat.findOne({
              isGroupChat: false,
              participants: { $all: [req.user._id, userId] }
          }).session(session);
  
          if (!chat) {
              chat = await Chat.create(
                  [
                      {
                          participants: [req.user._id, userId],
                          isGroupChat: false,
                          hasInitiated: [req.user._id]
                      }
                  ],
                  { session }
              );
              chat = chat[0];
          }
      } else {
          chat.hasInitiated.addToSet(req.user._id);
          await chat.save({ session });
      }
  
      // Commit transaction
      await session.commitTransaction();
  
      // End session here (AFTER commit)
      session.endSession();
  
      //  Run populate AFTER ending the session (prevents expired session error)
      chat = await Chat.findById(chat._id)
          .populate("participants", "name email profilePic")
          .populate("latestMessage");
  
      return res.status(200).json(new ApiResponse(200, chat));
  
  } catch (error) {
      //  Abort only if transaction is active
      if (session.inTransaction()) {
          await session.abortTransaction();
      }
  
      session.endSession();
      return res.status(500).json(new ApiError(500, "Failed to create chat"));
  }
  

  
});

// fetch chats for login user
const fetchChats = asyncHandler(async (req, res) => {
  const allChats = await Chat.find({
    participants: {
      $in: [req.user._id],
    },
    hasInitiated: {
      $in: [req.user._id],
    },
  })
    .populate("participants", "name email profilePic")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "name email profilePic",
      },
    })
    .sort({ updatedAt: -1 });

  return res.status(200).json(new ApiResponse(200, allChats));
});

// create a group

const createGroup = asyncHandler(async (req, res) => {
  // get group name and participants
  const { groupName, groupParticipants } = req.body;

  if (!groupName || !groupParticipants) {
    throw new ApiError(400, "Group name and participants are required");
  }

  // ensure admin is in participants
  if (!groupParticipants.includes(req.user._id)) {
    groupParticipants.push(req.user._id);
  }

  // check the participants
  if (groupParticipants.length < 2) {
    throw new ApiError(400, "Group must have at least 2 participants");
  }

  // create group chat
  const groupChat = await Chat.create({
    groupName,
    participants: groupParticipants,
    isGroupChat: true,
    groupAdmin: req.user._id,
    hasInitiated: groupParticipants,
  });

  // populate group chat
  const fullGroupChat = await Chat.findById(groupChat._id).populate(
    "participants",
    "name email profilePic"
  );

  return res.status(200).json(new ApiResponse(200, fullGroupChat));
});

// rename group
const renameGroup = asyncHandler(async (req, res) => {
  // get group id and name
  const { chatId, groupName } = req.body;

  // check if group exists
  const groupChat = await Chat.findById(chatId);
  if (!groupChat) {
    throw new ApiError(400, "Group does not exist");
  }

  // update group name
  groupChat.groupName = groupName;
  await groupChat.save();

  return res.status(200).json(new ApiResponse(200, groupChat));
});

// remove participant from group
const removeParticipant = asyncHandler(async (req, res) => {
  // get group id and participant id
  const { chatId, participantId } = req.body;

  // check if group exists
  const groupChat = await Chat.findById(chatId);
  if (!groupChat) {
    throw new ApiError(400, "Group does not exist");
  }

  // check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    throw new ApiError(400, "Participant does not exist");
  }

  // check if participant is admin
  if (groupChat.groupAdmin.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not admin of this group");
  }

  // remove participant from group
  const removedParticipant = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId,
        hasInitiated: participantId,
      },
    },
    {
      new: true,
    }
  );

  return res.status(200).json(new ApiResponse(200, removedParticipant));
});

// leave group
const leaveGroup = asyncHandler(async (req, res) => {
  // get group id
  const { chatId } = req.body;

  // check if group exists
  const groupChat = await Chat.findById(chatId);
  if (!groupChat) {
    throw new ApiError(400, "Group does not exist");
  }

  // check if user is in group
  if (!groupChat.participants.includes(req.user._id)) {
    throw new ApiError(400, "You are not in this group");
  }

  // remove user from group
  const removedUser = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: req.user._id,
        hasInitiated: req.user._id,
      },
    },
    {
      new: true,
    }
  );

  return res.status(200).json(new ApiResponse(200, removedUser));
});

// add participant to group

const addParticipant = asyncHandler(async (req, res) => {
  // get group id and participant id
  const { chatId, participantId } = req.body;

  // check if group exists
  const groupChat = await Chat.findById(chatId);
  if (!groupChat) {
    throw new ApiError(400, "Group does not exist");
  }

  // check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    throw new ApiError(400, "Participant does not exist");
  }

  // check if participant is admin
  if (groupChat.groupAdmin.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not admin of this group");
  }

  // add participant to group
  const addedParticipant = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        participants: participantId,
        hasInitiated: participantId,
      },
    },
    {
      new: true,
    }
  );

  return res.status(200).json(new ApiResponse(200, addedParticipant));
});

const chatController = {
  createChat,
  fetchChats,
  createGroup,
  renameGroup,
  removeParticipant,
  leaveGroup,
  addParticipant,
};

export default chatController;
