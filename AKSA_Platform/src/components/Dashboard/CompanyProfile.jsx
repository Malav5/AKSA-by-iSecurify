import Sidebar from "./Sidebar";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import AddMemberModal from "./AddMemberModal";
import DomainsInline from "../CompanyProfile/DomainsInline";
import MemberProfile from "../CompanyProfile/MemberProfile";
import SecuritySettings from "../CompanyProfile/SecuritySettings";
import Settings from "../CompanyProfile/Settings";
import UserManagement from "../CompanyProfile/UserManagement";
import NotificationSettings from "../CompanyProfile/NotificationSettings";
import axios from "axios";
import { userServices } from "../../services/UserServices";
import { createPortal } from "react-dom";
// Import icons for tabs
import { User, ShieldCheck, Bell, Settings as Cog, Users } from "lucide-react";

const ICONS = {
  member: <User className="w-5 h-5 mr-1" />,
  security: <ShieldCheck className="w-5 h-5 mr-1" />,
  notification: <Bell className="w-5 h-5 mr-1" />,
  settings: <Cog className="w-5 h-5 mr-1" />,
  "user-management": <Users className="w-5 h-5 mr-1" />,
};

const CompanyProfile = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("member"); // default
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const userMenuRef = useRef();
  const userButtonRef = useRef();
  const [profileData, setProfileData] = useState({
    logo: "/logo2.png",
    name: "Allianz Cloud",
    industry: "IT & Cloud Infrastructure Services",
    description:
      "Allianz Cloud India provides cutting-edge cloud infrastructure and IT solutions tailored for businesses seeking scalability, security, and digital innovation.",
    teamMembers: [],
    priorities: [
      "Enhanced Data Security & Privacy Compliance",
      "Seamless System Integration Capabilities",
      "Scalable Cloud Infrastructure",
    ],
    metrics: { customers: 87, countries: 14, partners: 32 },
    serviceProviders: {
      info: "Our trusted cybersecurity and technology service providers...",
      primary: "iSecurify - Cybersecurity Solutions",
      secondary: "CloudTech - Infrastructure Services",
      additionalText: "We continuously evaluate our service providers...",
    },
    foundingYear: 2016,
    headquarters: "Gujarat, India",
    employeeCount: 50,
    annualRevenue: "$45M",
    primaryMarkets: "India, USA, UK, Hong Kong, Kenya",
    securityCertifications: "ISO 27001, SOC 2, PCI DSS",
  });

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDomainsModal, setShowDomainsModal] = useState(false);
  const [showDomainsInline, setShowDomainsInline] = useState(false);
  const [role, setRole] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  const navigate = useNavigate();

  const tabRefs = useRef({});
  const [gliderStyle, setGliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    setLoadingMembers(true);
    setMembersError(null);
    fetch("http://localhost:3000/api/member/get-members")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then((data) => {
        setProfileData((prev) => ({
          ...prev,
          teamMembers: data.members || [],
        }));
        setLoadingMembers(false);
      })
      .catch((err) => {
        setMembersError(err.message);
        setLoadingMembers(false);
      });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userServices.getUser();
        setRole(data.user?.role || null);
        setUserPlan(data.user?.plan || null);
        setUser(data.user);
      } catch (err) {
        const user = JSON.parse(localStorage.getItem("user"));
        setRole(user?.role || null);
        setUserPlan(user?.plan || null);
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  // Fetch user info for dropdown
  useEffect(() => {
    const fetchUserInfo = async () => {
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

    fetchUserInfo();
  }, []);

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideUserMenu =
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target);

      if (isOutsideUserMenu) setShowUserMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Tabs to render (add User Management for admin and subadmin)
  const visibleTabs = [
    { label: "Member Profile", key: "member" },
    { label: "Security Settings", key: "security" },
    { label: "Notification Settings", key: "notification" },
    { label: "Settings", key: "settings" },
  ];
  if (role === "admin" || role === "subadmin") {
    visibleTabs.push({ label: "User Management", key: "user-management" });
  }

  useEffect(() => {
    // Update glider position and width when activeTab or window size changes
    const updateGlider = () => {
      const ref = tabRefs.current[activeTab];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const parentRect = ref.parentNode.getBoundingClientRect();
        setGliderStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    };
    updateGlider();
    window.addEventListener("resize", updateGlider);
    return () => window.removeEventListener("resize", updateGlider);
  }, [activeTab, visibleTabs.length]);

  // Generic handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (key, index, value) => {
    setProfileData((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleMetricChange = (key, value) => {
    const num = parseInt(value, 10);
    setProfileData((prev) => ({
      ...prev,
      metrics: { ...prev.metrics, [key]: isNaN(num) ? 0 : num },
    }));
  };

  const handleServiceProviderChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      serviceProviders: { ...prev.serviceProviders, [name]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with real API call to save data
    console.log("Updated Client Profile Data:", profileData);
    navigate("/dashboard");
  };

  // Handle logo image upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match(/^image\/(jpeg|png|gif|svg\+xml|webp)$/)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileData((prev) => ({ ...prev, logo: ev.target.result }));
        setLogoFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      alert(
        "Please select a valid image file (jpg, jpeg, png, gif, svg, webp)"
      );
    }
  };

  // Handle attachment upload (image only for now)
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match(/^image\/(jpeg|png|gif|svg\+xml|webp)$/)) {
      setAttachmentFile(file);
      // You can add logic to show preview or upload to server here
    } else {
      alert(
        "Please select a valid image file (jpg, jpeg, png, gif, svg, webp)"
      );
    }
  };

  // Light theme classes
  const mainBg = "bg-gray-50 min-h-screen";
  const cardBg = "bg-white";
  const border = "border border-gray-200";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";
  const tabActive = "border-b-2 border-[#800080] text-primary font-semibold";
  const tabInactive = "text-gray-500";

  return (
    <div className={`flex h-screen font-sans overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-white`}> {/* Subtle gradient background */}
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col h-screen my-4">
        <main className="flex-1 p-6 overflow-y-auto relative">
          {/* Decorative SVG background */}
          <svg className="absolute left-0 top-0 w-full h-40 opacity-10 pointer-events-none z-0" viewBox="0 0 1440 320" fill="none">
            <path fill="#a78bfa" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
          {/* Tabs */}
          <nav className="relative flex items-center justify-between space-x-1 md:space-x-6 mb-8 bg-white/80 backdrop-blur-lg px-1 py-3 rounded-2xl shadow-lg z-10" style={{ overflow: 'visible' }}>
            {/* Left side - Tab buttons */}
            <div className="flex space-x-2 md:space-x-6">
              {/* Glider */}
              <div
                className="absolute top-1/2 -translate-y-1/2  h-[44px] bg-primary rounded-full z-0 transition-all duration-300"
                style={{
                  left: gliderStyle.left,
                  width: gliderStyle.width,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 24px 0 rgba(128,0,128,0.10)',
                }}
              />
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  ref={el => tabRefs.current[tab.key] = el}
                  className={`relative flex items-center justify-center gap-2 h-12 px-6 rounded-full font-semibold transition-all duration-200 focus:outline-none text-base z-10
                    ${activeTab === tab.key
                      ? "text-white"
                      : "text-gray-700 hover:bg-primary/10 hover:text-primary"}
                  `}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ background: 'transparent', minWidth: 0 }}
                >
                  <span className="flex items-center justify-center h-5">{ICONS[tab.key]}</span>
                  <span className="flex items-center justify-center h-5 leading-none">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Right side - User Menu */}
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
              </button>

              {showUserMenu && createPortal(
                <div
                  ref={userMenuRef}
                  className="fixed top-26 right-4 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[99999]"
                >
                  <div className="p-3 sm:p-4 border-b border-gray-100">
                    <p className="text-2xl font-medium text-gray-900">
                      {user ? `${user.firstName} ${user.lastName}` : "User Name"}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email || "user@example.com"}</p>
                    <p className="text-sm text-gray-500">{user?.companyName || ""}</p>
                  </div>
                  <div className="p-1">
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
                </div>,
                document.body
              )}
            </div>
          </nav>

          {/* Tab Content */}
          <div className="relative z-10">
            {activeTab === "member" && (
              showDomainsInline ? (
                <DomainsInline setShowDomainsInline={setShowDomainsInline} />
              ) : (
                <MemberProfile
                  profileData={profileData}
                  cardBg={cardBg}
                  border={border}
                  handleLogoChange={handleLogoChange}
                  setShowDomainsInline={setShowDomainsInline}
                  handleAttachmentChange={handleAttachmentChange}
                  userPlan={userPlan}
                />
              )
            )}

            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "notification" && <NotificationSettings />}
            {activeTab === "settings" && <Settings />}
            {activeTab === "user-management" && (role === "admin" || role === "subadmin") && (
              <UserManagement
                showAddMemberModal={showAddMemberModal}
                setShowAddMemberModal={setShowAddMemberModal}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyProfile;
