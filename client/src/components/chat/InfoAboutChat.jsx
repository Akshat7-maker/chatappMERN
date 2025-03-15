import React, { useEffect, useState } from 'react'
import { useChatContext } from '../../context/chatContext';
import configAPI from '../../configApi/configAPI';
import axios from 'axios';
import useLoder from '../../customHooks/loader';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useSocketContext } from '../../context/socketContext';
import toast from 'react-hot-toast';


function InfoAboutChat() {

    const { selectedChat, loginUser, setSelectedChat, setOpenChatInfo } = useChatContext();
    const [removingLoding, removingError, withLoder] = useLoder();
    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();




    const AdminRemoveMemberHandler = async (memberId) => {
        // console.log("remove member", memberId);

        const config = configAPI();
        const { data } = await axios.post("http://localhost:8000/api/v1/chat/remove-member", { chatId: selectedChat._id, participantId: memberId }, config);

        const { data: response } = data;
        if (response) {
            console.log(response);
            navigate("/");
            toast.success("Member removed successfully");
            setSelectedChat(null);
        }
    }


    const leaveGroupHandler = async () => {

        await withLoder(async () => {

            console.log("leave group");
            // send leave group request
            const config = configAPI();
            const { data } = await axios.post("http://localhost:8000/api/v1/chat/leave-group", { chatId: selectedChat._id }, config);

            const { data: response } = data;
            if (response) {
                // console.log(response);
                navigate("/");
                setSelectedChat(null);
            }
        })
    }

    const addMemberHandler = async (member) => {
        // console.log("add member", member);
        // check if member is already in the group
        // console.log(selectedChat);
        // console.log(selectedChat.participants.find(findMember => findMember._id === member));
        if (selectedChat.participants.find(findMember => findMember._id === member)) {
            toast.error("Member already added");
        } else {
            // send add member request
            const config = configAPI();
            const { data } = await axios.post("http://localhost:8000/api/v1/chat/add-member", { chatId: selectedChat._id, participantId: member }, config);

            const { data: response } = data;
            if (response) {
                // console.log(response);
                navigate("/");
                toast.success("Member added successfully");
                setSelectedChat(null);
            }
        }
    }



    const socket = useSocketContext();

    useEffect(() => {
        if (socket) {
            socket.on("search-results", ({ users }) => {
                // console.log("Search Results:", users);
                setSearchResults(users);
                setLoading(false);
            });

            socket.on("search-results-error", (error) => {
                // console.log("Search Error:", error);
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

    useEffect(() => {
        if (!search.trim() || !socket) {
            setLoading(false);
            setSearchResults([]);
            return;
        }

        setLoading(true);

        const delayDebounceFn = setTimeout(() => {
            socket.emit("search-users", { query: search, userId: loginUser._id });
        }, 1000); // Adjust the delay as needed

        return () => clearTimeout(delayDebounceFn);

    }, [search, socket]);

    return (
        <div className="absolute inset-0 flex justify-center items-center  bg-opacity-40 z-50">
          <div
            className={`w-96 ${selectedChat?.isGroupChat ? "min-h-140" : "h-80"} bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl shadow-lg p-6`}
          >
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setOpenChatInfo(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
    
            {/* Group Chat UI */}
            {selectedChat?.isGroupChat ? (
              <>
                {/* Group Name */}
                <h2 className="text-xl font-bold text-center mb-4">{selectedChat?.groupName}</h2>
    
                {/* Group Members */}
                <p className="font-semibold text-lg mb-3">Group Members</p>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                  {selectedChat?.participants?.map((member) => (
                    <div key={member._id} className="flex justify-between items-center p-2">
                      <div className="flex items-center">
                        <img src={member.profilePic} alt="" className="w-10 h-10 rounded-full" />
                        <p className="ml-2">{member._id === loginUser._id ? "You" : member.name}</p>
                      </div>
    
                      {/* Role and Remove Button */}
                      {member._id === selectedChat?.groupAdmin ? (
                        <p className="font-semibold text-sm bg-green-400 px-2 py-1 rounded">Admin</p>
                      ) : loginUser._id === selectedChat?.groupAdmin ? (
                        <button
                          onClick={() => AdminRemoveMemberHandler(member._id)}
                          className="font-semibold text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-400 transition"
                        >
                          Remove
                        </button>
                      ) : (
                        <p className="font-semibold text-sm bg-amber-500 px-2 py-1 rounded">Member</p>
                      )}
                    </div>
                  ))}
                </div>
    
                {/* Admin Controls */}
                {loginUser._id === selectedChat?.groupAdmin ? (
                  <div className="flex flex-wrap justify-center mt-4 gap-3">
                    <button className="btn-danger">Leave Group</button>
                    <button className="btn-danger">Delete Group</button>
                    <button className="btn-danger">Change Group Name</button>
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      className="btn-primary"
                    >
                      Add Member
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center mt-4">
                    <button onClick={leaveGroupHandler} className="btn-danger">
                      Leave Group
                    </button>
                  </div>
                )}
    
                {/* Search Feature */}
                {showSearch && (
                  <div className="mt-6">
                    {/* Search Input */}
                    <div className="flex items-center border rounded-lg px-3 py-2">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full border-none outline-none px-2"
                      />
                      <FaSearch className="text-gray-500" />
                    </div>
    
                    {/* Loading & Results */}
                    {loading ? (
                      <p className="text-center mt-3">Loading...</p>
                    ) : searchResults.length === 0 && search.trim() ? (
                      <p className="text-center mt-3">No results found</p>
                    ) : (
                      <div className="max-h-20 overflow-y-auto border rounded-lg mt-3">
                        {searchResults.map((user) => (
                          <div key={user._id} className="flex justify-between items-center p-2">
                            <div className="flex items-center">
                              <img src={user.profilePic} alt="" className="w-10 h-10 rounded-full" />
                              <p className="ml-2">{user.name}</p>
                            </div>
                            <button
                              onClick={() => addMemberHandler(user._id)}
                              className="btn-success"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // **Private Chat UI**
              <div className="flex flex-col items-center">
                <img
                  src={selectedChat?.participants?.find((p) => p._id !== loginUser._id)?.profilePic}
                  alt=""
                  className="w-33 h-33 rounded-full mb-3"
                />
                <p className="text-4xl font-bold">
                  {selectedChat?.participants?.find((p) => p._id !== loginUser._id)?.name}
                </p>
                <p className="text-3xl text-gray-600">
                  {selectedChat?.participants?.find((p) => p._id !== loginUser._id)?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      );
}

export default InfoAboutChat
