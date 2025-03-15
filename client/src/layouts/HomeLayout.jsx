import React, { use, useEffect, useState } from 'react'
import MyChats from '../components/chat/MyChats'
import { useLocation } from 'react-router-dom'
import GroupChat from '../components/chat/GroupChat';

function HomeLayout() {

  const location = useLocation();

  const [refresh , setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(!refresh);
  }, [location])
  return (
    
    <MyChats key={refresh}/>
    
  )
}

export default HomeLayout


//  {allMessages.length > 0 ? (
//           console.log("grouped messages", groupedMessages),
//           allMessages
//             .map((message) => (
//               message.sender._id === loginUser._id ? (
//                 <div key={message._id} className='flex flex-col self-end bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs shadow-md break-words whitespace-pre-wrap '>
//                   {message.content}
//                   {/* time stamp */}
//                   <span className='text-xs text-white ml-auto self-end inline-flex'>
//                     {format(new Date(message.createdAt), 'hh:mm a')}
//                   </span>
//                   <span className='text-xs text-white ml-2 self-end inline-flex'>
//                     {message.readby.length === selectedChat?.participants?.length - 1 ? '✓✓' : '✓'}
//                   </span>
//                 </div>
//               ) : (
//                 <div key={message._id} className={`self-start bg-gray-200 text-gray-900 px-4 py-2 rounded-lg max-w-xs shadow-md break-words whitespace-pre-wrap ${selectedChat?.isGroupChat ? 'flex flex-col' : ''}`}>
//                   {/* messaage sender name */}
//                   {selectedChat?.isGroupChat && (
//                     <div className='text-xs text-gray-500 mb-1'>
//                       {message.sender.name}
//                     </div>
//                   )}
//                   {/* message content */}
//                   <div>{message.content}</div>
//                   {/* time stamp */}
//                   <span className='text-xs text-gray-500 ml-auto self-end inline-flex'>
//                     {format(new Date(message.createdAt), 'hh:mm a')}
//                   </span>
//                 </div>
//               )
//             ))
//         ) : (
//           fetchLoding ? (
//             <div>Loading...</div>
//           ) : (
//             <div>No messages</div>
//           )

//         )}