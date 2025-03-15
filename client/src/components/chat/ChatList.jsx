import React, { use, useEffect, useState } from 'react'
import useLoder from '../../customHooks/loader';
import axios from 'axios';
import { useChatContext } from '../../context/chatContext';
import configAPI from '../../configApi/configAPI';
import GroupChat from './GroupChat';
import { useSocketContext } from '../../context/socketContext';
import toast from 'react-hot-toast';

function ChatList() {

    // const [MyChats, setMyChats] = useState(null);
    const [loding, error, withLoder] = useLoder();
    const {loginUser, selectedChat, setSelectedChat, MyChats, setMyChats,chatListRefresh , setOpenGroupModal} = useChatContext();

    const [joinRoomLoding, setJoinRoomLoding] = useState(false);
    const socket = useSocketContext();

    const fetchChats = async () => {

        // console.log(loginUser);
        // console.log("config", config);
        await withLoder(async () => {

          let config = configAPI();
          const { data } = await axios.get("http://localhost:8000/api/v1/chat/fetch", config);
          const { data: chats } = data;
          // console.log("fetchChats", chats);

          // once chats are fetched, join each chat room
          socket.emit("join-chats", { userId: loginUser._id, chatRooms: chats.map((chat) => chat._id) });
          setJoinRoomLoding(true);
          setMyChats(chats);
        });
      };

      useEffect(() => {
        if (!loginUser || !socket) return;
        fetchChats();
      }, [loginUser, chatListRefresh, socket]);

      // catch the success response once all rooms are joined
      useEffect(() => {
        if (!socket) return;
        socket.on("join-chats-success", (s) => {
          if (s === "success") {
            setJoinRoomLoding(false);
            // toast.success("All rooms joined successfully");
          }
        });
      }, [socket]);

    //   if(error) return <div>{error}</div>

    if (!loginUser || !socket) return null
    if (joinRoomLoding) return <div className="text-center text-red-400">Something went wrong</div>;
    
    return (
      <div className="col-span-12 md:col-span-3 h-full rounded-xl bg-[#121212] p-4 border border-gray-700 shadow-md">
      {/* Heading */}
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <h1 className="text-lg font-semibold text-white">Chats</h1>
        <button
          className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 transition-all rounded-lg text-white shadow-sm"
          onClick={() => setOpenGroupModal(true)}
        >
          + New Group
        </button>
      </div>
    
        {loding && <div className="text-center text-blue-400">Loading...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
    
        {/* Chat List */}
        {MyChats && MyChats.length > 0 ? (
           <div className="space-y-2">
           {MyChats.map((chat) => {
            // console.log("my chats sss", chat)
             const isSelected = selectedChat?._id === chat._id;
             const isUnread =
               chat?.latestMessage &&
               chat?.latestMessage?.sender?._id !== loginUser._id &&
               !chat?.latestMessage?.readby?.includes(loginUser._id);
   
             return (
               <div
                 key={chat._id}
                 className={`p-3 rounded-lg cursor-pointer flex items-center transition-all 
                   ${
                     isSelected
                       ? "bg-[#1E1E1E] border border-blue-400 shadow-lg"
                       : "hover:bg-gradient-to-r from-[#1E1E1E] to-[#292929]"
                   } 
                   ${
                     isUnread 
                       ? "border border-blue-500 shadow-lg"
                       : "border border-gray-700"
                   }`}
                 onClick={() => setSelectedChat(chat)}
               >
                 {/* Avatar */}
                 <img
                   className="w-12 h-12 rounded-full object-cover border border-gray-600 shadow-md"
                   src={
                     chat?.isGroupChat
                       ? chat?.groupImage || chat?.groupIcon
                       : chat?.participants?.find((p) => p._id !== loginUser._id)?.profilePic
                   }
                   alt="avatar"
                 />
                 {/* Chat Details */}
                 <div className="ml-3 flex-1">
                   <p className="font-medium text-gray-200">
                     {chat?.isGroupChat
                       ? chat?.groupName
                       : chat?.participants?.find((p) => p._id !== loginUser._id)?.name}
                   </p>
                   {chat?.latestMessage && (
                     <p className={`text-sm  ${isUnread ? "text-blue-400 font-semibold" : "text-gray-400"}`}>
                       {isSelected ? null : (
                         <>
                           {chat?.latestMessage?.sender?._id === loginUser._id ? "You" : chat?.latestMessage?.sender?.name}
                           {`: ${chat?.latestMessage?.type === "file" ? "[File]" : chat?.latestMessage?.content?.length > 20 ? chat?.latestMessage?.content?.substring(0, 15) + "..." : chat?.latestMessage?.content}`}
                         </>
                       )}
                     </p>
                   )}
                 </div>
                 {/* Unread Message Indicator */}
                 {isUnread &&  (
                   <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse ml-auto"></span>
                 )}
               </div>
             );
           })}
         </div>
        ) : (
          <div className="text-center text-gray-500">No Chats</div>
        )}
      </div>
    );
    

    



  
  
}

export default ChatList

// old
// return (
//   <div className='col-span-12 md:col-span-3 h-full rounded-2xl bg-gray-100 p-4 border border-gray-300 shadow-lg '>
//     {/* Heading */}
//     <div className='flex justify-between items-center mb-4 flex-wrap'>
//       <h1 className='p-2 text-xl font-bold block'>Your Chats</h1>
//       <button
//         className='px-4 py-2 text-sm font-bold bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all '
//         onClick={() => setOpenGroupModal(true)}
//       >
//         <span className=''>New Group chat +</span>
//       </button>
//     </div>

//     {loding && <div>Loading...</div>}
//     {error && <div>{error}</div>}

//     {/* Chat List */}
//     {MyChats && MyChats.length > 0 ? (
//       <div className='space-y-2'>
//         {MyChats.map((chat) => (
//           <div
//           key={chat._id}
//           className={`p-3 rounded-lg cursor-pointer flex items-center transition-all ${selectedChat?._id === chat._id ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
//           onClick={() => setSelectedChat(chat)}
//           >
//             {console.log("chatsss", chat)}
//             <img
//               className='w-10 h-10 rounded-full object-cover'
//               src={chat?.isGroupChat ? chat?.groupImage ? chat?.groupImage : chat?.groupIcon : chat?.participants?.find((p) => p._id !== loginUser._id)?.profilePic}
//               alt='avatar'
//             />
//             <div className='ml-3'>
//               <p className='font-bold text-gray-800'>{chat?.isGroupChat ? chat?.groupName : chat?.participants?.find((p) => p._id !== loginUser._id)?.name}</p>
//               {chat?.latestMessage && (
//                  <p className={`text-xs ${
//                   chat?.latestMessage?.sender?._id === loginUser._id ? 
//                  'text-gray-600' : 
//                  chat?.latestMessage?.readby?.includes(loginUser._id) ? 
//                  'text-gray-600' : 'text-green-800'}`}
//                  >
                  
//                      {selectedChat?._id === chat._id ? null : (<span className="font-semibold">
//                      {chat?.latestMessage?.sender?._id === loginUser._id ? "You" : chat?.latestMessage?.sender?.name}
//                      {`: ${chat?.latestMessage?.type === "file" ? "file" : chat?.latestMessage?.content}`}
//                      </span>)}
//                    </p>
//                  )}
//             </div>
//           </div>
//         ))}
//       </div>
//     ) : (
//       <div className='text-center text-gray-600'>No Chats</div>
//     )}
//   </div>
// );