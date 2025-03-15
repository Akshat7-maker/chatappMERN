import React, { useCallback, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { useChatContext } from "../context/chatContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import configAPI from "../configApi/configAPI";
import toast from "react-hot-toast";
import { format } from "date-fns";

function Navbar() {
  const {
    openSideBar,
    setOpenSideBar,
    loginUser,
    setLoginUser,
    notifications,
    selectedChat,
    setSelectedChat,
  } = useChatContext();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const toggleNotificationDropdown = useCallback(() => {
    setNotificationDropdown(prev => !prev);
  }, []);




  const notificationList = useMemo(() => {
    return notifications.length > 0 ? (
      notifications.map((message) => (
        <span
          key={message._id}
          onClick={() => setSelectedChat(message.chat)}
          className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex justify-between"
        >
          <div>
            <strong>
              {message.chat.isGroupChat
                ? `${message.chat.groupName}:`
                : message.sender.name}
            </strong>{" "}
            {message.content}
          </div>
          <div className="text-xs text-gray-400">
            {format(new Date(message.createdAt), "hh:mm a")}
          </div>
        </span>
      ))
    ) : (
      <p className="px-4 py-2 text-gray-500">No notifications</p>
    );
  }, [notifications, selectedChat]);
  

  const handleLogout = async () => {
    try {
      const config = configAPI();
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/user/logout",
        {},
        config
      );

      if (data.statusCode === 200) {
        toast.success("Logged out successfully");
        setLoginUser(null);
        navigate("/login");
        sessionStorage.removeItem("user");
      }
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <nav className="relative bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg px-6 py-4 flex items-center justify-between">
      {/* Left Section (Search) */}
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
        onClick={() => setOpenSideBar(!openSideBar)}
      >
        <FaSearch className="text-lg" />
        <span className="hidden md:block">Search User</span>
      </button>

      {/* Center Section (Brand Name) */}
      <h1 className="text-2xl font-bold tracking-wide">Chatter Box</h1>

      {/* Right Section (Notifications & Profile) */}
      <div className="flex items-center gap-6 relative">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotificationDropdown}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
          >
            <IoNotifications className="text-lg" />
            <span className="hidden md:block">Notifications</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationDropdown && loginUser && (
            <div className="absolute right-0 mt-2 w-64 max-h-60 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg shadow-lg z-50 overflow-y-auto transition-all duration-300 opacity-100 scale-100">
              {notificationList}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
          >
            {loginUser?.profilePic ? (
              <img
                src={loginUser.profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ) : (
              <span className="text-lg">👤</span>
            )}
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg shadow-lg z-50 transition-all duration-300 opacity-100 scale-100">
              {loginUser ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
