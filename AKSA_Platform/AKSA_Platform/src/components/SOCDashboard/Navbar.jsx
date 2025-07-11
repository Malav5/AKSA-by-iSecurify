import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users2, Bell } from 'lucide-react';
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
        companyName: socRole === 'admin' ? 'Admin' : 'SOC User',
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
    console.log('User submitted:', newUser);
    setShowAddUser(false);
    // TODO: Send to backend if needed
  };

  const navItems = [
    { path: '/soc', label: 'Dashboard' },
    { path: '/alerts', label: 'Alerts' },
    { path: '/logs', label: 'Vulnerabilities' },
    { path: '/settings1', label: 'Settings' },
  ];

  return (
    <nav className="w-full h-20 flex items-center px-6 bg-white border-b border-gray-300 shadow-sm fixed top-0 z-50">
      {/* Logo + Title */}
      <div className="flex items-center gap-2 min-w-[220px] flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <Users2 className="text-white" size={28} />
        </div>
        <span className="ml-2 text-2xl font-bold text-black whitespace-nowrap">SOC Dashboard</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex justify-center overflow-x-auto scrollbar-hide">
        <div className="flex gap-8 items-center">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`text-lg font-medium ${
                location.pathname === path
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Notification & User Section */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button ref={notificationButtonRef} onClick={toggleNotifications}>
            <Bell className="w-7 h-7 text-gray-600 hover:text-blue-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div
              ref={panelRef}
              className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded z-50"
            >
              <div className="p-3 font-semibold border-b">SOC Notifications</div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  <ul>
                    {notifications.map((n, i) => (
                      <li key={i} className="p-3 hover:bg-gray-50 border-b text-sm">
                        {n.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button ref={userButtonRef} onClick={toggleUserMenu} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-lg font-medium text-gray-700">
              {user?.firstName || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div ref={userMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50">
              <div className="p-4 border-b">
                <p className="text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="p-1">
                {localStorage.getItem('role') === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/assign-agent');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Assign Agent
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowAddUser(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
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
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    localStorage.clear();
                    navigate('/soc-login');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
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
