import React, { useState } from 'react'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import GroupChat from './GroupChat';
import { useChatContext } from '../../context/chatContext';

function MyChats() {

  const [fetchAgain, setFetchAgain] = useState(false);
  const { isMediumScreen, selectedChat } = useChatContext();
  return (
    <>
      <div className='grid grid-cols-12 gap-3 mt-3 h-screen overflow-hidden z-5'>
        {/* Chat List - Hidden when a chat is selected on medium screens */}

        {/* {(!isMediumScreen || !selectedChat) && (
        
      <ChatList key={fetchAgain}/>
      )} */}

        {(isMediumScreen && selectedChat) ? (
          null
        ) : (
          <ChatList key={fetchAgain} />
        )}

        {/* Chat Window - Only visible when a chat is selected */}
        {/* {selectedChat && (

      )} */}
        <ChatWindow fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </div>

      <GroupChat />
    </>

  )
}

export default MyChats
