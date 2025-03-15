import React, { useEffect, useState } from "react";
import { useChatContext } from "../../context/chatContext";
import { useSocketContext } from "../../context/socketContext";
import toast from "react-hot-toast";
import configAPI from "../../configApi/configAPI";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoClose, IoPersonAdd, IoSearch } from "react-icons/io5";
import API_BASE_URL from "../../configApi/ApiBaseUrl";

const GroupChat = () => {
  const { openGroupModal, setOpenGroupModal, loginUser } = useChatContext();
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const socket = useSocketContext();

  useEffect(() => {
    if (!query.trim() || !socket) {
      setLoading(false);
      setSearchResults([]);
      return;
    }

    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      socket.emit("search-users", { query, userId: loginUser._id });
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [query, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("search-results", ({ users }) => {
        setSearchResults(users);
        setLoading(false);
      });

      socket.on("search-results-error", (error) => {
        setError(error);
        setLoading(false);
      });
    }

    return () => {
      if (socket) {
        socket.off("search-results");
        socket.off("search-results-error");
      }
    };
  }, [socket]);

  const addMemberHandler = (member) => {
    if (!members.find((m) => m._id === member._id)) {
      setMembers((prev) => [...prev, member]);
    } else {
      toast.error("Member already added");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (members.length < 2) {
      toast.error("Please add at least 2 members to create a group chat.");
      return;
    }

    try {
      const config = configAPI();
      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/chat/create-group`,
        { groupName, groupParticipants: members.map((m) => m._id) },
        config
      );

      if (data.chat) {
        setOpenGroupModal(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {openGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-[400px] bg-gradient-to-r from-indigo-900 to-purple-900">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Group Chat</h2>
              <button
                onClick={() => {
                  setOpenGroupModal(false);
                  setGroupName("");
                  setMembers([]);
                  setQuery("");
                  setSearchResults([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={22} />
              </button>
            </div>

            {/* Group Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Group Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded mt-1 focus:ring focus:ring-blue-300"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>

            {/* Selected Members */}
            {members.length > 0 && (
              <div className="w-full p-2 border rounded mb-4 bg-gray-100 max-h-24 overflow-y-auto flex flex-wrap gap-2">
                {members.map((member) => (
                  <span
                    key={member._id}
                    className="flex items-center gap-2 px-2 py-1 bg-gray-200 rounded-full text-sm"
                  >
                    <span>{member.name}</span>
                    <button
                      type="button"
                      className="text-red-500 text-xs px-1"
                      onClick={() => setMembers(members.filter((m) => m._id !== member._id))}
                    >
                      ✖
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative mb-4">
              <label className="block text-sm font-medium">Add Members:</label>
              <div className="flex items-center border rounded mt-1">
                <IoSearch className="ml-2 text-gray-500" />
                <input
                  type="text"
                  className="w-full p-2 outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members..."
                />
              </div>
            </div>

            {/* Search Results */}
            {loading && <p className="text-sm text-gray-500">Searching...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && searchResults?.length === 0 && query.trim() && (
              <p className="text-sm text-gray-500">No results found</p>
            )}
            {searchResults?.length > 0 && (
              <div
                className={`w-full p-2 border rounded mb-4 bg-gray-50 max-h-[120px] overflow-y-auto flex flex-col gap-2`}
              >
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center border-b py-2 px-2 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={user.profilePic} alt="User" className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-1 hover:bg-blue-500 transition"
                      onClick={() => addMemberHandler(user)}
                    >
                      <IoPersonAdd size={16} />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => {
                  setOpenGroupModal(false);
                  setGroupName("");
                  setMembers([]);
                  setQuery("");
                  setSearchResults([]);
                }}
              >
                Cancel
              </button>
              <button type="submit" onClick={handleCreateGroup} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChat;
