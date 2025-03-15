import { useState, useEffect } from "react";

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMediumScreen, setIsMediumScreen] = useState(window.innerWidth < 768);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Chat List - Hidden when a chat is selected on medium screens */}
      {(!isMediumScreen || !selectedChat) && (
        <div className="w-full md:w-1/3 bg-gray-100 p-4 border-r">
          <h2 className="text-lg font-bold">Chats</h2>
          <ul>
            {["Alice", "Bob", "Charlie"].map((chat) => (
              <li
                key={chat}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => setSelectedChat(chat)}
              >
                {chat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat Window - Only visible when a chat is selected */}
      {selectedChat && (
        <div className="w-full md:w-2/3 bg-white p-4">
          {isMediumScreen && (
            <button
              onClick={() => setSelectedChat(null)}
              className="mb-2 text-blue-500"
            >
              ← Back
            </button>
          )}
          <h2 className="text-lg font-bold">Chat with {selectedChat}</h2>
          <p>Chat window content...</p>
        </div>
      )}
    </div>
  );
}
