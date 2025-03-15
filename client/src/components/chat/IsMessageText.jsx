import { format } from 'date-fns'
import React from 'react'

function IsMessageText({ message, isSender, isGroupChat, selectedChat }) {
    return (
        <div
            className={`
                px-4 py-2 rounded-lg border border-amber-950 max-w-xs shadow-md break-words whitespace-pre-wrap 
                ${isSender
                    ? 'bg-blue-500 text-white '   // Sender messages (right-aligned, blue)
                    : 'bg-gray-200 text-gray-900 '  // Receiver messages (left-aligned, gray)
                }`}
        >
            {/* Group Chat: Show sender's name for received messages */}
            {isGroupChat && !isSender && (
                <div className="text-xs text-gray-500 mb-1">
                    {message.sender.name}
                </div>
            )}

            {/* Message Content */}
            <div>{message?.content}</div>

            {/* Timestamp & Read Receipts */}
            <div className="text-xs mt-1 flex justify-end">
                <span>
                    {format(new Date(message?.createdAt), 'hh:mm a')}
                </span>
                {isSender && (
                    <span className="ml-2">
                        {message.readby.length === selectedChat?.participants?.length - 1 ? '✓✓' : '✓'}
                    </span>
                )}
            </div>
        </div>
    )
}

export default IsMessageText


//  <div
//                     className={`px-4 py-2 rounded-lg border border-amber-950 max-w-xs shadow-md break-words whitespace-pre-wrap ${message.sender._id === loginUser._id
//                       ? 'bg-blue-500 text-white '   // Sender messages (right-aligned, blue)
//                       : 'bg-gray-200 text-gray-900 '  // Receiver messages (left-aligned, gray)
//                       }`}
//                   >
//                     {/* Group Chat: Show sender's name for received messages */}
//                     {selectedChat?.isGroupChat && message.sender._id !== loginUser._id && (
//                       <div className="text-xs text-gray-500 mb-1">
//                         {message.sender.name}
//                       </div>
//                     )}

//                     {/* Message Content */}
//                     <div>{message.content}</div>

//                     {/* Timestamp & Read Receipts */}
//                     <div className="text-xs mt-1 flex justify-end">
//                       <span>
//                         {format(new Date(message.createdAt), 'hh:mm a')}
//                       </span>
//                       {message.sender._id === loginUser._id && (
//                         <span className="ml-2">
//                           {message.readby.length === selectedChat?.participants?.length - 1 ? '✓✓' : '✓'}
//                         </span>
//                       )}
//                     </div>
//                   </div>
