import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users2, Bell, Home, Shield, Settings } from 'lucide-react';
import AddUserModal from './AddUserModal';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);

  const userButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const socUsername = localStorage.getItem('soc_username');
    const socFullname = localStorage.getItem('soc_fullname');
    const socEmail = localStorage.getItem('soc_email');
    const socRole = localStorage.getItem('role');

    if (socUsername && socFullname) {
      const nameParts = socFullname.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setUser({
        firstName,
        lastName,
        email: socEmail || socUsername,
        companyName: socRole === 'subadmin' ? 'Admin' : 'SOC User',
      });
    }
  }, []);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
    setShowNotifications(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const outsideNotif =
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target);

      const outsideUserMenu =
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target);

      if (outsideNotif) setShowNotifications(false);
      if (outsideUserMenu) setShowUserMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleAddUserSubmit = (newUser) => {
    setShowAddUser(false);
    // TODO: Send to backend if needed
  };

  const navItems = [
    { path: '/soc', label: 'Dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
    { path: '/alerts', label: 'Alerts', icon: <Bell className="w-5 h-5 mr-2" /> },
    { path: '/logs', label: 'Vulnerabilities', icon: <Shield className="w-5 h-5 mr-2" /> },
    { path: '/settings1', label: 'Settings', icon: <Settings className="w-5 h-5 mr-2" /> },
  ];

  return (
    <nav className="w-full h-20 flex items-center px-6 bg-white border-b border-gray-200 shadow-sm fixed top-0 z-50">
      {/* Logo + Title */}
      <div className="flex items-center gap-3 min-w-[200px] flex-shrink-0">
        <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow">
          <Shield className="text-white" size={28} />
        </div>
        <span className="ml-2 text-2xl font-extrabold text-gray-900 tracking-tight whitespace-nowrap">SOC Dashboard</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex justify-center overflow-x-auto scrollbar-hide">
        <div className="flex gap-8 items-center">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center text-lg px-3 py-1 transition font-medium ${location.pathname === path
                ? 'text-primary border-b-2 font-semibold'
                : 'text-gray-500 hover:text-primary hover:bg-secondary'
                }`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Notification & User Section */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            onClick={toggleNotifications}
            className="relative p-2 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            aria-label="Notifications"
          >
            <Bell className="w-7 h-7 text-gray-600 hover:text-blue-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div
              ref={panelRef}
              className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-xl z-50 border border-gray-100"
            >
              <div className="p-4 font-bold border-b text-gray-800">SOC Notifications</div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  <ul>
                    {notifications.map((n, i) => (
                      <li key={i} className="p-4 hover:bg-gray-50 border-b text-sm">
                        {n.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-base">
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
            className="flex items-center space-x-2 group focus:outline-none"
          >
            <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold shadow group-hover:bg-blue-700 transition">
              {user?.firstName?.charAt(0).toUpperCase() || <Users2 size={24} />}
            </div>
            {/* <span className="hidden sm:block text-lg font-semibold text-gray-800 group-hover:text-[#800080] transition">
              {user?.firstName || 'User'}
            </span> */}
          </button>

          {showUserMenu && (
            <div
              ref={userMenuRef}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 border border-gray-100"
            >
              <div className="p-4 border-b">
                <p className="text-lg font-bold text-primary">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="p-1">
                {localStorage.getItem('role') === 'subadmin' && (
                  <>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/assign-agent');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm rounded transition"
                    >
                      Assign Agent
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowAddUser(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm rounded transition"
                    >
                      Add User
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm rounded transition"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    localStorage.removeItem("soc_username");
                    localStorage.removeItem("soc_fullname");
                    localStorage.removeItem("soc_email");
                    localStorage.removeItem("soc_token");
                    localStorage.removeItem("soc_role");
                    navigate('/dashboard'); // Changed from /soc-login to /dashboard
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm rounded transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSubmit={handleAddUserSubmit}
        />
      )}
    </nav>
  );
};

export default Navbar;
