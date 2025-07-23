import React, { useEffect, useState } from "react";
import { LayoutDashboard, AlertCircle, Settings, ShieldCheck, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../index.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    { Icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { Icon: AlertCircle, label: "Domain Detail", path: "/domain" },
    { Icon: ShieldCheck, label: "SOC", path: "/soc-login", forceReload: true, openInNewTab: true },
    { Icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (item) => {
    if (item.forceReload) {
      // Handle external links
      window.open(item.path, item.openInNewTab ? "_blank" : "_self");
    } else {
      // Handle internal navigation
      navigate(item.path);
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile and Desktop */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-56 xl:w-64 bg-white border-r border-gray-200 flex flex-col h-screen transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        {/* Top Section */}
        <div className="mr-2 md:mr-4 flex-1">
          <div className="flex items-center justify-center mb-4 md:mb-6 mt-2 md:mt-3 bg-white">
            <div className="flex items-baseline space-x-1 md:space-x-2">
              <h1 className="text-2xl md:text-3xl font-semibold">AKSA</h1>
              <div className="flex items-center space-x-1">
                <span className="text-sm md:text-base">By</span>
                <img src="/logo1_cut.png" alt="Logo" className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-sm md:text-base">iSecurify</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center my-4 md:my-6">
            {user ? (
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.companyName || "User"
                  }`}
                alt="Profile"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs md:text-sm">Loading...</span>
              </div>
            )}
            <span className="font-semibold mt-2 text-sm md:text-base text-center px-2">
              {user?.companyName || "Loading..."}
            </span>
          </div>

          <nav className="space-y-3 md:space-y-6 ml-2 md:ml-4 text-gray-700">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleNavClick(item)}
                className={`flex items-center space-x-2 cursor-pointer px-3 md:px-4 py-2 rounded-md transition-all duration-200 text-sm md:text-base ${isActive(item.path)
                  ? "bg-secondary text-primary hover:bg-secondary/80"
                  : "text-gray-700 hover:bg-[#fff3ff]"
                  }`}
              >
                <item.Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
