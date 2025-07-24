import Sidebar from "./Sidebar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import AddMemberModal from "./AddMemberModal";
import DomainsInline from "../CompanyProfile/DomainsInline";
import MemberProfile from "../CompanyProfile/MemberProfile";
import SecuritySettings from "../CompanyProfile/SecuritySettings";
import Settings from "../CompanyProfile/Settings";
import UserManagement from "../CompanyProfile/UserManagement";
import NotificationSettings from "../CompanyProfile/NotificationSettings";
import axios from "axios";

const TABS = [
  { label: "Member Profile", key: "member" },
  { label: "Security Settings", key: "security" },
  { label: "Notification Settings", key: "notification" },
  { label: "Settings", key: "settings" },
  // User Management tab will be conditionally added below
];

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState("member");
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

  const navigate = useNavigate();

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
    // Fetch user info from backend for accurate role
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
        setRole(response.data.user?.role || null);
      } catch (err) {
        // fallback to localStorage if backend fails
        const user = JSON.parse(localStorage.getItem("user"));
        setRole(user?.role || null);
      }
    };
    fetchUser();
  }, []);

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
      alert("Please select a valid image file (jpg, jpeg, png, gif, svg, webp)");
    }
  };

  // Handle attachment upload (image only for now)
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match(/^image\/(jpeg|png|gif|svg\+xml|webp)$/)) {
      setAttachmentFile(file);
      // You can add logic to show preview or upload to server here
    } else {
      alert("Please select a valid image file (jpg, jpeg, png, gif, svg, webp)");
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

  // Tabs to render (add User Management only for admin)
  const visibleTabs = [
    { label: "Member Profile", key: "member" },
    { label: "Security Settings", key: "security" },
    { label: "Notification Settings", key: "notification" },
    { label: "Settings", key: "settings" },
  ];
  if (role === "admin") {
    visibleTabs.push({ label: "User Management", key: "user-management" });
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${mainBg}`}>
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col h-screen my-4">
        {/* <header className="sticky top-0 z-10">
          <Header />
        </header> */}

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Tabs */}
          <nav className="flex space-x-8 border-b mb-8 bg-white px-4 py-2 rounded-t-lg shadow-sm">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                className={`pb-2 px-1 transition-colors duration-150 focus:outline-none ${activeTab === tab.key ? tabActive : tabInactive}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
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
              />
            )
          )}

          {activeTab === "security" && <SecuritySettings />}

          {activeTab === "notification" && <NotificationSettings />}
          {activeTab === "settings" && <Settings />}

          {activeTab === "user-management" && role === "admin" && (
            <UserManagement
              showAddMemberModal={showAddMemberModal}
              setShowAddMemberModal={setShowAddMemberModal}
            // ...other props as needed
            />
          )}
        </main>
      </div>

      {/* Domains Modal */}
      {showDomainsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-primary text-2xl font-bold" onClick={() => setShowDomainsModal(false)}>&times;</button>
            <div className="mb-4">
              <span className="text-gray-500 text-sm">Members / My domains</span>
              <h2 className="text-xl font-bold mt-2 mb-1 text-primary">Listing all domains <span className="font-normal text-gray-700">1 domains</span></h2>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input type="text" placeholder="Search" className="w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-gray-50" />
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700"><input type="checkbox" /></th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Domain</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Schedule</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Last scan</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Error code</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Scan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" /></td>
                    <td className="px-4 py-3 text-gray-900 font-medium">allianzcloud.com</td>
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button title="Favorite" className="text-gray-400 hover:text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="1.5" /></svg></button>
                      <button title="Delete" className="text-red-400 hover:text-red-600"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" /></svg></button>
                    </td>
                    <td className="px-4 py-3">12 Feb, 2024 at 10:00</td>
                    <td className="px-4 py-3">12 Jul, 2025 at 10:35</td>
                    <td className="px-4 py-3"><span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">Complete</span></td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3"><label className="inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-400 transition"></div></label></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
