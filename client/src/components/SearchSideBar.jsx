import React, { useState } from "react";
import axios from "axios";
import useLoder from "../customHooks/loader";
import { useChatContext } from "../context/chatContext";
import configAPI from "../configApi/configAPI";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaSearch } from "react-icons/fa";
import API_BASE_URL from "../configApi/ApiBaseUrl";

function SearchSideBar() {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState(null);
  const [loding, error, withLoder] = useLoder();
  const { openSideBar, setOpenSideBar } = useChatContext();
  const navigate = useNavigate();

  const handleSearch = async () => {
    await withLoder(async () => {
      const config = configAPI();
      const { data } = await axios.get(`${API_BASE_URL}/api/v1/user/search?search=${searchText}`, config);
      const { data: users } = data;
      setUsers(users);
    });
  };

  const handleSelectUser = async (user) => {
    const config = configAPI();
    const { data } = await axios.post(`${API_BASE_URL}/api/v1/chat/create`, { userId: user._id }, config);
    const { data: chat } = data;

    if (chat) {
      setOpenSideBar(false);
      navigate('/');
    }
  };

  const handleCloseSideBar = () => {
    setOpenSideBar(false);
    setSearchText("");
    setUsers(null);
  };

  return (
    <div
      className={`h-screen bg-black/60 backdrop-blur-lg text-white fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out shadow-xl
        ${openSideBar ? "w-80 sm:w-96 translate-x-0" : "w-0 -translate-x-full"} rounded-r-xl`}
    >
      {openSideBar && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h1 className="text-lg font-semibold">Search User</h1>
            <button
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
              onClick={handleCloseSideBar}
            >
              <FaTimes size={18} className="text-gray-300" />
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center bg-gray-800 p-2 rounded-lg mx-4 mt-4">
            <input
              type="text"
              placeholder="Search by Name or Email"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 p-2 bg-transparent text-white outline-none placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchText.trim()) {
                  handleSearch();
                }
              }}
            />
            <button
              className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition-all"
              disabled={!searchText}
              onClick={handleSearch}
            >
              <FaSearch className="text-white" />
            </button>
          </div>

          {/* Loading & Error Messages */}
          {loding && <h1 className="text-center mt-4 text-blue-400">Loading...</h1>}
          {error && <h1 className="text-red-400 text-center mt-4">{error}</h1>}

          {/* Search Results */}
          {users && users.length > 0 ? (
            <div className="mt-4 space-y-2 mx-4">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex flex-col p-3 bg-gray-900 hover:bg-gray-800 transition-all rounded-lg shadow-md border border-gray-700"
                >
                  <span className="font-semibold text-white">{user.name}</span>
                  <span className="text-sm text-gray-400">{user.email}</span>
                </button>
              ))}
            </div>
          ) : users && users.length === 0 ? (
            <h1 className="text-center mt-4 text-gray-500">No user found</h1>
          ) : null}
        </>
      )}
    </div>
  );

  
}

export default SearchSideBar;


// return (

  //   <div
  //     className={`h-screen bg-blue-500 text-white p-4 fixed top-0 left-0 z-50 
  //   transition-transform duration-300 ease-in-out shadow-lg
  //   ${openSideBar ? "w-72 sm:w-80 md:w-96 translate-x-0" : "w-0 -translate-x-full"}`}
  //   >
  //     {openSideBar && (
  //       <>
  //         {/* Heading */}
  //         <div className="flex justify-between items-center mb-4">
  //           <h1 className="text-xl font-semibold">Search User</h1>
  //           <button
  //             className="p-2 rounded-full hover:bg-blue-600 transition-all"
  //             onClick={handleCloseSideBar}
  //           >
  //             <FaTimes size={18} />
  //           </button>
  //         </div>

  //         {/* Search Box */}
  //         <div className="flex items-center bg-white rounded-lg overflow-hidden">
  //           <input
  //             type="text"
  //             placeholder="Search by Name or Email"
  //             value={searchText}
  //             onChange={(e) => setSearchText(e.target.value)}
  //             className="flex-1 p-2 text-gray-800 outline-none"
  //             onKeyDown={(e) => {
  //               if (e.key === "Enter" && searchText.trim()) {
  //                 handleSearch();
  //               }
  //             }}
  //           />
  //           <button
  //             className="bg-blue-600 p-2 hover:bg-blue-700 transition-all rounded-xl"
  //             disabled={!searchText}
  //             onClick={handleSearch}
  //           >
  //             <FaSearch className="text-white" />
  //           </button>
  //         </div>

  //         {/* Loading & Error Messages */}
  //         {loding && <h1 className="text-center mt-4">Loading...</h1>}
  //         {error && <h1 className="text-red-400 text-center mt-4">{error}</h1>}

  //         {/* Search Results */}
  //         {users && users.length > 0 ? (
  //           <div className="mt-4 flex flex-col gap-2">
  //             {users.map((user) => (
  //               <button
  //                 key={user._id}
  //                 onClick={() => handleSelectUser(user)}
  //                 className="p-3 bg-white text-gray-800 rounded-lg shadow-md hover:bg-gray-100 transition-all flex flex-col"
  //               >
  //                 <span className="font-semibold">{user.name}</span>
  //                 <span className="text-sm text-gray-500">{user.email}</span>
  //               </button>
  //             ))}
  //           </div>
  //         ) : users && users.length === 0 ? (
  //           <h1 className="text-center mt-4">No user found</h1>
  //         ) : null}
  //       </>
  //     )}
  //   </div>
  // );
