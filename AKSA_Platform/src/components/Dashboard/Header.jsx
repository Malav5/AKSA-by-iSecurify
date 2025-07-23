import React, { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const panelRef = useRef();
  const userMenuRef = useRef();
  const userButtonRef = useRef();
  const notificationButtonRef = useRef();
  const { notifications, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/auth/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUser();
  }, []);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
    setShowNotifications(false);
  };

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside notifications dropdown and button
      const isOutsideNotifications = 
        panelRef.current && 
        !panelRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target);

      // Check if click is outside user dropdown and button
      const isOutsideUserMenu = 
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target);

      // Close dropdowns if clicking outside
      if (isOutsideNotifications) {
        setShowNotifications(false);
      }
      
      if (isOutsideUserMenu) {
        setShowUserMenu(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
      {/* Left Section - Search and Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile Menu Button - Only show on mobile since sidebar has its own */}
        <div className="lg:hidden">
          <div className="w-8 h-8 flex items-center justify-center">
            {/* This space is reserved for potential mobile menu button */}
          </div>
        </div>

        {/* Page Title */}
        <div className="hidden sm:block">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>
      </div>

      {/* Right Section - Notifications and User */}
      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            onClick={toggleNotifications}
            className="relative p-2 rounded-lg transition-colors"
          >
            <Bell className="w-8 h-8 sm:w-9 sm:h-9 text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              ref={panelRef}
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border-b">
                <span className="font-semibold text-sm sm:text-base">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-60 sm:max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {notifications.map((note, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 sm:p-4 hover:bg-gray-50 transition"
                      >
                        <span className="text-lg flex-shrink-0">{note.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{note.message}</p>
                          <span className="text-xs text-gray-400">
                            {note.time}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 sm:p-5 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            ref={userButtonRef}
            onClick={toggleUserMenu}
            className="flex items-center space-x-2"
          >
            {user ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm sm:text-base font-medium text-gray-700">U</span>
              </div>
            )}
            {/* <span className="hidden sm:block text-xl font-medium text-gray-700">
              {user ? `${user.firstName}` : "User"}
            </span> */}
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div
              ref={userMenuRef}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
            >
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <p className="text-2xl font-medium text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : "User Name"}
                </p>
                <p className="text-sm text-gray-500 ">{user?.email || "user@example.com"}</p>
                <p className="text-sm text-gray-500 ">{user?.companyName || ""}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    navigate("/company-profile");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
