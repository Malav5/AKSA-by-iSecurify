import React, { useEffect, useState } from "react";
import { LayoutDashboard, AlertCircle, Settings, ShieldCheck, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../index.css";
import Pricing from "../Home/Pricing";
import ModalPortal from "../ui/ModalPortal";
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    { Icon: ShieldCheck, label: "SOC", path: "/soc" }, // Changed from /soc-login
    { Icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = async (item) => {
    if (item.label === "Dashboard") {
      // Check if user has domains
      try {
        const token = localStorage.getItem("token");
        const userEmail = user?.email || localStorage.getItem("currentUser");
        const res = await axios.get("/api/domains", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userDomains = res.data.filter(domain => domain.userEmail === userEmail);
        if (userDomains.length > 0) {
          navigate("/dashboard");
        } else {
          navigate("/deaddashboard");
        }
      } catch (err) {
        navigate("/deaddashboard");
      }
    } else if (item.label === "SOC") {
      if (user?.plan === "Freemium") {
        setShowUpgradeModal(true);
      } else {
        // Set SOC user info for the SOC dashboard
        if (user) {
          localStorage.setItem('soc_email', user.email);
          localStorage.setItem('soc_username', user.firstName + ' ' + user.lastName);
          localStorage.setItem('soc_fullname', user.firstName + ' ' + user.lastName);
          localStorage.setItem('role', user.role);
        }
        navigate("/soc");
      }
    } else if (item.forceReload) {
      window.open(item.path, item.openInNewTab ? "_blank" : "_self");
    } else {
      navigate(item.path);
    }
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

      {/* Modal */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-gray-900/50 bg-opacity-40 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
              <h2 className="text-xl font-semibold mb-2">Upgrade Required</h2>
              <p className="text-gray-700 mb-4">
                Please purchase our next plan to access SOC services.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowModal(false) }}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showUpgradeModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-gray-900/50 bg-opacity-40 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
              <h2 className="text-xl font-semibold mb-2">Upgrade Required</h2>
              <p className="text-gray-700 mb-4">
                Upgrade your plan to access SOC services.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    navigate("/upgrade-plan");
                  }}
                  className="px-4 py-2 rounded-md bg-primary text-white hover:bg-blue-700"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </>
  );
};

export default Sidebar;
