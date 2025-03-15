import { format } from "date-fns";
import React from "react";


function IsMessageFile({ message, isSender, isGroupChat, selectedChat }) {
  const fileExtension = message.content.split(".").pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension);

  const isPdf = fileExtension === "pdf";
  return (
    <div
      className={`px-4 py-2 rounded-lg border border-amber-950 max-w-xs shadow-md break-words
         ${isSender ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}
    >
      {/* Group Chat: Show sender's name for received messages */}
      {isGroupChat && !isSender && (
        <div className="text-xs text-gray-500 mb-1">{message.sender.name}</div>
      )}

      {/* File Preview (if it's an image) */}
      {isImage && (
        <img
          src={message.content}
          alt="Uploaded File"
          className="max-w-full rounded-md mb-2"
        />
      )}

      {/* File Preview (if it's a PDF) */}
      {isPdf && (
        <div className="flex flex-col items-center gap-2">
          <iframe src={`https://docs.google.com/gview?url=${message.content}&embedded=true`} width="100%" height="70px"></iframe>
          <a
            href={message.content}
            download
            className="px-2 py-1 text-xs bg-green-500 text-white rounded-md"
          >
            Download PDF
          </a>
        </div>

      )}

      {/* Timestamp & Read Receipts */}
      <div className="text-xs mt-1 flex justify-end">
        <span>{format(new Date(message.createdAt), "hh:mm a")}</span>
        {isSender && (
          <span className="ml-2">
            {message.readby.length === selectedChat?.participants?.length - 1
              ? "✓✓"
              : "✓"}
          </span>
        )}
      </div>
    </div>
  );
}

export default IsMessageFile;
