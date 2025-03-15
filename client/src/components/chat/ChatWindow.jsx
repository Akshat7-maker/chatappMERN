import React, { useEffect, useRef, useState } from 'react'
import { useChatContext } from '../../context/chatContext'
import useLoder from '../../customHooks/loader';
import { IoAttach, IoClose, IoInformationCircleOutline, IoSend } from 'react-icons/io5';
import { useSocketContext } from '../../context/socketContext';
import configAPI from '../../configApi/configAPI';
import axios from 'axios';
import toast from 'react-hot-toast';
import GroupChat from './GroupChat';
import InfoAboutChat from './InfoAboutChat';
import { format } from 'date-fns';
import IsMessageText from './IsMessageText';
import IsMessageFile from './IsMessageFile';
import API_BASE_URL from '../../configApi/ApiBaseUrl';




function ChatWindow() {

  const {
    selectedChat,
    setSelectedChat,
    loginUser,
    notifications,
    setNotifications,
    MyChats,
    setMyChats,
    setChatListRefresh,
    setOpenGroupModal,
    isMediumScreen,
    openChatInfo,
    setOpenChatInfo } = useChatContext();
  const [loding, error, withLoder] = useLoder();
  const [fetchLoding, fetchError, fetchWithLoder] = useLoder();
  const [sendLoding, sendError, sendWithLoder] = useLoder();
  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const socket = useSocketContext();
  const messageEndRef = useRef(null);
  const chatRefContainer = useRef(null);
  const [newMessageAdded, setNewMessageAdded] = useState(false);
  const [groupedMessages, setGroupedMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreviewURL, setFilePreviewURL] = useState(null);
  const [uplodingFile, setUploadigFile] = useState(false)




  // scroll to bottom
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  }

  // fetch messages
  const fetchMessages = async () => {
    if (!selectedChat?._id) return;
    const config = configAPI();

    await fetchWithLoder(async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/v1/message/all/${selectedChat._id}?page=${page}&limit=12`, config);
      const { data: allMessagesResponse } = data;
      let fetchedMessages = allMessagesResponse.reverse()
      // console.log(fetchedMessages);

      if (fetchedMessages.length === 0) {
        setHasMore(false);
      } else {

        setAllMessages((prev) => {
          const existingMessages = new Set(prev.map((message) => message._id));
          // console.log("existingMessages", existingMessages.length);
          const newMessages = fetchedMessages.filter((message) => !existingMessages.has(message._id));
          // console.log("newMessages", newMessages.length);
          return [...newMessages, ...prev];
        })
        socket.emit("message-read", { chatId: selectedChat._id, readByUserId: loginUser._id, senderIds: selectedChat.participants.filter((user) => user._id !== loginUser._id).map((user) => user._id) });

      }

    })
    socket.emit("join-chat", selectedChat._id);
  }

  // handle file change 
  const handleFileUpload = (e) => {
    // console.log(e.target.files)
    const selectedFile = e.target.files[0]

    if (!selectedFile) return
    setFile(selectedFile)

    // generate Preview of file
    const previewFile = URL.createObjectURL(selectedFile)
    setFilePreviewURL(previewFile)
    setMessage("")
  }

  const handleCancelUpload = () => {
    setFile(null);
    setFilePreviewURL(null);
  };


  // send message
  const handleSendMessage = async () => {
    // console.log({ message, selectedChat });

    if (!message.trim() && !file) return;



    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("content", message);

    if (file) {
      setUploadigFile(true)

    }



    const config = configAPI();
    socket.emit("stop-typing", { chatId: selectedChat._id, userId: loginUser._id });
    await sendWithLoder(async () => {
      setFilePreviewURL(null);
      const { data } = await axios.post(`${API_BASE_URL}/api/v1/message/send/${selectedChat._id}`, formData, config);
      const { data: messageResponse } = data;

      // console.log(messageResponse);

      if (messageResponse) {
        socket.emit("send-message", { message: messageResponse, chatId: selectedChat._id, reciverId: selectedChat.participants.filter((user) => user._id !== loginUser._id)[0]._id });

        // setAllMessages((prev) => [...prev, messageResponse]);
        setMessage("");
        setNewMessageAdded(true);
        scrollToBottom();
        setFile(null);
        setFilePreviewURL(null);
        setUploadigFile(false)
      }
    })
  }


  const handleTyping = (e) => {
    if (!e.target.value) {
      socket.emit("stop-typing", { chatId: selectedChat._id, userId: loginUser._id });
      setMessage("");
      return;
    }



    setMessage(e.target.value);
    socket.emit("typing", { chatId: selectedChat._id, userId: loginUser._id });

    setTimeout(() => {
      socket.emit("stop-typing", { chatId: selectedChat._id, userId: loginUser._id })

    }, 2000);
  };




  // handle infinite scroll
  const handleScroll = (e) => {
    // console.log("scrolling", e.target.scrollTop === 0);
    if (e.target.scrollTop === 0 && allMessages.length > 0 && hasMore) {
      // console.log("scroll to top");
      setPage((prev) => prev + 1);
    }
  };


  // Function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groupedMessagesOnject = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groupedMessagesOnject[date]) {
        groupedMessagesOnject[date] = [];
      }
      groupedMessagesOnject[date].push(message);
    });
    return groupedMessagesOnject;
  };




  useEffect(() => {
    if (!file) return

    // console.log("fileeee previewwww", filePreviewURL)
    return () => {
      if (filePreviewURL) {
        URL.revokeObjectURL(filePreviewURL); // Free up memory
      }
    };
  }, [filePreviewURL]);


  // fetch messages
  useEffect(() => {
    if (!selectedChat) return;


    setAllMessages([]);
    setPage(1);
    setHasMore(true);

    setTimeout(() => {
      scrollToBottom();
    }, 1000);

    if (page === 1) {

      fetchMessages();
    }


    // remove notifications related to selected chat
    if (notifications.length > 0) {
      setNotifications((prev) => prev.filter((n) => n.chat._id !== selectedChat._id));
    }
  }, [selectedChat]);


  // fetch messages on page change
  useEffect(() => {
    if (!selectedChat) return;

    fetchMessages();

  }, [page]);


  // group messages
  useEffect(() => {
    if (!selectedChat || allMessages.length === 0) return;
    


    const groupedMessagesToShow = groupMessagesByDate(allMessages);

    setGroupedMessages(groupedMessagesToShow);



  }, [allMessages]);






  // handle typing
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleTypingmessage = ({ userId, chatId }) => {
      if (chatId === selectedChat._id && !typingUsers.includes(userId)) {
        setTypingUsers((prev) => [...prev, userId]);

      }
    };


    const handleStopTyping = ({ userId, chatId }) => {
      if (chatId === selectedChat._id && typingUsers.includes(userId)) {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }
    };

    socket.on("typing", handleTypingmessage);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTypingmessage);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [socket, selectedChat, typingUsers]);


  // recive message annd send to notifications if not in selected chat
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (data) => {
      // console.log("recived message", data);

      // check if recived message belongs to selected chat id
      if (data.chat._id === selectedChat?._id) {
        setAllMessages((prev) => [...prev, data]);
        socket.emit("message-read", { chatId: data.chat._id, readByUserId: loginUser._id, senderIds: selectedChat.participants.filter((user) => user._id !== loginUser._id).map((user) => user._id) });
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        // if not in selected chat add to notifications
        // console.log("my chats", MyChats);
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={data.sender.profilePic}
                    alt=""
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {data.chat.isGroupChat ? data.chat.groupName : data.sender.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {data.content}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ))
        setNotifications((prev) => [...prev, data]);
        setChatListRefresh((prev) => !prev);


        // send to notifications
        // toast.success(` ${data.sender.name}: ${data.content}`, { autoClose: 100 });
        // toast.custom((t) => (
        //   <div
        //     className={`${
        //       t.visible ? 'animate-enter' : 'animate-leave'
        //     } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        //   >
        //     <div className="flex-1 w-0 p-4">
        //       <div className="flex items-start">
        //         <div className="flex-shrink-0 pt-0.5">
        //           <img
        //             className="h-10 w-10 rounded-full"
        //             src={data.sender.profilePic}
        //             alt=""
        //           />
        //         </div>
        //         <div className="ml-3 flex-1">
        //           <p className="text-sm font-medium text-gray-900">
        //             {data.sender.name}
        //           </p>
        //           <p className="mt-1 text-sm text-gray-500">
        //             {data.content}
        //           </p>
        //         </div>
        //       </div>
        //     </div>
        //     <div className="flex border-l border-gray-200">
        //       <button
        //         onClick={() => toast.dismiss(t.id)}
        //         className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        //       >
        //         Close
        //       </button>
        //     </div>
        //   </div>
        // ))
        // setNotifications((prev) => [...prev, data]);
      }
    }

    socket.on("receive-message", messageHandler);

    return () => {
      socket.off("receive-message", messageHandler);
    }
  }, [socket, selectedChat, MyChats]);

  // handle mark message as read
  useEffect(() => {
    if (!loginUser || !selectedChat) return;


    // for reciver
    socket.on("message-read-success", ({ readByUserId, chatId, senderIds }) => {
      // console.log("READ", userId, chatId, reciverId);
      if (selectedChat._id === chatId) {
        setAllMessages((prev) => prev.map((message) => {
          // console.log("MESS", message);
          return senderIds.includes(message.sender._id) && !message.readby.includes(readByUserId) ? { ...message, readby: [...message.readby, readByUserId] } : message
        }))
      }

    });

    // for sender 
    socket.on("i-have-read-message", ({ readByUserId, chatId, senderIds }) => {
      // console.log("READ", readByUserId, chatId);
      // console.log("i-have-read-message", MyChats);

      setMyChats((prev) => {
        return prev.map((chat) => {
          return chat._id === chatId && !chat.latestMessage?.readby?.includes(readByUserId) ?
            { ...chat, latestMessage: { ...chat.latestMessage, readby: [...chat.latestMessage?.readby, readByUserId] } } : chat
        })
      })
    });

    return () => {
      socket.off("message-read-success");
      socket.off("i-have-read-message");
    }
  }, [socket, loginUser, selectedChat])








  if (!loginUser) return <div>loading...</div>

  if (!selectedChat) {
    return (
      <div className="hidden md:col-span-9 h-full md:flex justify-center items-center border border-gray-700 shadow-lg rounded-2xl bg-[#121212]">
        <h1 className="md:text-2xl md:font-bold text-gray-400">
          Select a user to start chat
        </h1>
      </div>
    );
  }


  if (loding) {
    return (
      <div className="col-span-9 border h-full flex justify-center items-center bg-[#121212]">
        <h1 className="text-2xl font-bold text-blue-400">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-9 border h-full flex justify-center items-center bg-[#121212]">
        <h1 className="text-2xl font-bold text-red-400">{error}</h1>
      </div>
    );
  }




  // return (

  //   <div className=' relative col-span-12 md:col-span-9  h-full rounded-2xl flex flex-col bg-gray-100 border border-gray-300 shadow-lg z-40'>
  //     {/* Profile pic and name navbar */}
  //     <div className='h-[50px] bg-blue-500 text-white flex justify-between items-center p-4 rounded-t-2xl border-b shadow-md'>
  //       <div className='md:hidden'>
  //         <button onClick={() => setSelectedChat(null)} className='text-white font-semibold'>
  //           &larr; Back
  //         </button>
  //       </div>
  //       <div className='ml-2 text-lg font-bold truncate'>
  //         {selectedChat?.isGroupChat ? selectedChat?.groupName : selectedChat?.participants?.find((p) => p._id !== loginUser._id)?.name}
  //       </div>
  //       <button
  //         onClick={() => setOpenChatInfo(true)}
  //         className='cursor-pointer'>
  //         <p className='text-sm opacity-80'>Info</p>
  //       </button>
  //     </div>

  //     {/* Chat messages */}
  //     <div
  //       onScroll={handleScroll}
  //       ref={chatRefContainer}
  //       className='p-4 overflow-y-auto flex flex-col space-y-2  h-[calc(100vh-150px)]   md:h-[calc(100vh-180px)] '>
  //       {/* h-[calc(100vh-150px)] */}


  //       {allMessages.length > 0 ? (
  //         Object.keys(groupedMessages).map((dateKey) => (
  //           <div key={dateKey} className="w-full ">
  //             {/* Date Header */}
  //             <div className="text-center text-gray-500 my-2 text-sm font-semibold ">
  //               {dateKey}
  //             </div>

  //             {/* Messages under this date */}
  //             {groupedMessages[dateKey].map((message) => {

  //               const isSender = message.sender._id === loginUser._id
  //               const isGroupChat = selectedChat?.isGroupChat

  //               return (
  //                 <div
  //                   key={message._id}
  //                   className={`flex w-full  my-1.5  ${isSender ? 'justify-end' : 'justify-start'}`}
  //                 >
  //                   {message.type === "text" ? (
  //                     <IsMessageText message={message} isSender={isSender} isGroupChat={isGroupChat} selectedChat={selectedChat} />
  //                   ) : message.type === "file" ? (
  //                     <IsMessageFile message={message} isSender={isSender} isGroupChat={isGroupChat} selectedChat={selectedChat} />
  //                   ) : null}
  //                 </div>)
  //             })}
  //           </div>
  //         ))
  //       ) : (
  //         fetchLoding ? (
  //           <div>Loading...</div>
  //         ) : (
  //           <div>No messages</div>
  //         )
  //       )}

  //       {uplodingFile && (
  //         <div className=' flex justify-end'>
  //           <div className='max-w-60'>Uploding file...</div>
  //           </div>
  //       )}


  //       <div ref={messageEndRef} />



  //       {/* Typing Indicator */}
  //       {typingUsers.length > 0 && selectedChat?.participants?.map((participant) => (
  //         typingUsers.includes(participant._id) && (
  //           <div key={participant._id} className='self-start bg-gray-200 px-4 py-2 rounded-lg max-w-xs text-gray-500 text-sm'>
  //             {participant.name} is typing...
  //           </div>
  //         )
  //       ))}



  //     </div>

  //     <div className='relative'>

  //       {/* Message Input */}
  //       <div className='bg-white flex items-center p-3 rounded-b-2xl shadow-md border-t'>

  //         {/* Message Input */}
  //         <input
  //           type='text'
  //           className='flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
  //           placeholder='Type a message...'
  //           value={message}
  //           onChange={handleTyping}
  //           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
  //           disabled={!!file}
  //         />

  //         {/* file input*/}
  //         <div className=' ml-3 relative flex items-center'>
  //           <input
  //             type='file'
  //             id='fileInput'
  //             className='absolute opacity-0 w-0 h-0'
  //             onChange={handleFileUpload}
  //           />
  //           <label
  //             htmlFor='fileInput'
  //             className='cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition'>
  //             <IoAttach size={24} />
  //           </label>
  //         </div>



  //         {/* send button */}
  //         <button
  //           disabled={!message && !file}
  //           onClick={handleSendMessage}
  //           className='ml-3 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50'>
  //           <IoSend size={24} />
  //         </button>


  //         {/* File Preview Popup */}

  //         {filePreviewURL && (
  //           <div className="absolute bottom-16 left-0 right-0 flex justify-center">
  //             <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
  //               <p className="text-gray-700">File Preview</p>
  //               {file.type.startsWith("image/") ? (
  //                 <img src={filePreviewURL} alt="Preview" className="w-40 h-40 object-cover rounded-lg mt-2" />
  //               ) : file.type === "application/pdf" ? (
  //                 <iframe src={filePreviewURL} className="w-40 h-40 mt-2" />
  //               ) : (
  //                 <p className="mt-2">{file.name}</p>
  //               )}
  //               <div className="flex gap-2 mt-3">
  //                 <button onClick={handleCancelUpload} className="text-red-500">
  //                   <IoClose size={24} />
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //         )}
  //       </div>

  //     </div>

  //     {openChatInfo && <InfoAboutChat />}
  //   </div>
  // )


  return (
    <div className="relative col-span-12 md:col-span-9 h-full rounded-2xl flex flex-col bg-[#121212] border border-gray-700 shadow-lg z-40">
      {/* Profile Pic and Name Navbar */}
      <div className="h-[50px] bg-gradient-to-r from-purple-600 to-pink-500 text-white flex justify-between items-center p-4 rounded-t-2xl border-b shadow-md">
        <div className="md:hidden">
          <button onClick={() => setSelectedChat(null)} className="text-white font-semibold">
            &larr; Back
          </button>
        </div>
        <div className="ml-2 text-lg font-bold truncate">
          {selectedChat?.isGroupChat
            ? selectedChat?.groupName
            : selectedChat?.participants?.find((p) => p._id !== loginUser._id)?.name}
        </div>
        <button
          onClick={() => setOpenChatInfo(true)}
          className="text-white text-2xl hover:opacity-80 transition-opacity"
        >
          <IoInformationCircleOutline /> {/* Info Icon */}
        </button>
      </div>

      {/* Chat Messages */}
      <div
        onScroll={handleScroll}
        ref={chatRefContainer}
        className="p-4 overflow-y-auto flex flex-col space-y-2 h-[calc(100vh-150px)] md:h-[calc(100vh-180px)]"
      >
        {allMessages.length > 0 ? (
          Object.keys(groupedMessages).map((dateKey) => (
            <div key={dateKey} className="w-full">
              {/* Date Header */}
              <div className="text-center text-gray-500 my-2 text-sm font-semibold">{dateKey}</div>

              {/* Messages */}
              {groupedMessages[dateKey].map((message) => {
                const isSender = message.sender._id === loginUser._id;
                const isGroupChat = selectedChat?.isGroupChat;

                return (
                  <div key={message._id} className={`flex w-full my-1.5 ${isSender ? "justify-end" : "justify-start"}`}>
                    {message.type === "text" ? (
                      <IsMessageText isSender={isSender} isGroupChat={isGroupChat} message={message} selectedChat={selectedChat} />

                    ) : message.type === "file" ? (
                      <IsMessageFile isSender={isSender} isGroupChat={isGroupChat} message={message} selectedChat={selectedChat} />

                    ) : null}
                  </div>
                );
              })}
            </div>
          ))
        ) : fetchLoding ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <div className="text-center text-gray-500">No messages</div>
        )}

        {/* Uploading File Indicator */}
        {uplodingFile && (
          <div className="flex justify-end">
            <div className="max-w-60 text-gray-400">Uploading file...</div>
          </div>
        )}

        <div ref={messageEndRef} />

        {/* Typing Indicator */}
        {typingUsers.length > 0 &&
          selectedChat?.participants?.map(
            (participant) =>
              typingUsers.includes(participant._id) && (
                <div
                  key={participant._id}
                  className="self-start bg-gray-700 px-4 py-2 rounded-lg max-w-xs text-gray-300 text-sm animate-pulse"
                >
                  {participant.name} is typing...
                </div>
              )
          )}
      </div>



      {/* Message Input */}
      <div className="relative bg-[#1A1A1A] flex items-center p-3 rounded-b-2xl shadow-md border-t border-gray-700">
        <input
          type="text"
          className="flex-1 p-2 bg-[#222222] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={message}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={!!file}
        />

        {/* File Input */}
        <div className="ml-3 relative flex items-center">
          <input type="file" id="fileInput" className="absolute opacity-0 w-0 h-0" onChange={handleFileUpload} />
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 transition"
          >
            <IoAttach size={24} className="text-white" />
          </label>
        </div>

        {/* Send Button */}
        <button
          disabled={!message && !file}
          onClick={handleSendMessage}
          className="ml-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
        >
          <IoSend size={24} />
        </button>

        {/* File Preview Popup */}
        {filePreviewURL && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center">
            <div className="bg-[#222222] p-4 rounded-lg shadow-lg flex flex-col items-center border border-gray-600">
              <p className="text-gray-300">File Preview</p>
              <p className="mt-2 text-gray-400">{file.name}</p>
              <button onClick={handleCancelUpload} className="mt-2 text-red-500">
                <IoClose size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      {openChatInfo && <InfoAboutChat />}
    </div>
  );
}

export default ChatWindow

