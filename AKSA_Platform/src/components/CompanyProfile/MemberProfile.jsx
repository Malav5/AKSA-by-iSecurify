// MemberProfile.jsx
import React, { useEffect, useState } from "react";
import { userServices } from "../../services/UserServices";
import { domainServices } from "../../services/domainServices";
import { Building2, UploadCloud, Paperclip } from "lucide-react";

const MemberProfile = ({
  profileData,
  cardBg,
  border,
  handleLogoChange,
  setShowDomainsInline,
  handleAttachmentChange,
  userPlan,
}) => {
  const [domainCount, setDomainCount] = useState(0);
  const [companyName, setCompanyName] = useState(profileData.name || "");

  useEffect(() => {
    const fetchDomainCount = async () => {
      try {
        const userEmail = localStorage.getItem("currentUser");
        const domains = await domainServices.fetchDomains();
        const userDomains = domains.filter(
          (domain) => domain.userEmail === userEmail
        );
        setDomainCount(userDomains.length);
      } catch (error) {
        console.error("Error fetching domains:", error);
        setDomainCount(0);
      }
    };
    fetchDomainCount();
  }, []);

  useEffect(() => {
    const fetchUserCompany = async () => {
      const data = await userServices.getUser();
      if (data?.user?.companyName) {
        setCompanyName(data.user.companyName);
      } else {
        setCompanyName(profileData.name || "");
      }
    };
    fetchUserCompany();
  }, []);

  return (
    <div>
      {/* Hero/Banner */}
      <section className="relative rounded-2xl overflow-hidden mb-8 animate-fade-in-down">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-white to-purple-50 opacity-80 z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center border-4 border-purple-300 shadow-lg overflow-hidden">
              <img
                src={profileData.logo}
                alt="Company Logo"
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-primary">
                {companyName}
              </h1>
              <p className="text-gray-600 text-lg font-medium mt-1">
                {profileData.industry}
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end items-center">
            <input
              id="logo-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg shadow hover:bg-[#700070] transition-all duration-200 text-base font-semibold"
              onClick={() => document.getElementById("logo-upload-input").click()}
              type="button"
            >
              <UploadCloud className="w-5 h-5" /> Upload Logo
            </button>
            <span className="text-xs text-purple-400 mt-1">Max image size 800kbs</span>
          </div>
        </div>
      </section>

      {/* Company Info Card */}
      <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <InfoItem label="Customer code" value="ALL" />
          <InfoItem label="Number of Employees" value="-" />
          <InfoItem label="Expected Devices" value="0" />
          <InfoItem label="Member Domains" value={<span>{domainCount} <span className="text-primary underline cursor-pointer ml-2 text-sm" onClick={() => setShowDomainsInline(true)}>View my domains</span></span>} />
          <InfoItem label="Company Status" value={<span className="text-primary font-bold">{userPlan || "-"}</span>} />
          <InfoItem label="Industry" value={profileData.industry} />
        </div>
      </section>

      {/* Attachments Section */}
      <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 animate-fade-in-up">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-primary">
          <Paperclip className="w-5 h-5" /> Attachments (0)
        </h2>
        <input
          id="attachment-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAttachmentChange}
        />
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1 flex items-center border-2 border-dashed border-purple-200 rounded-lg p-4 bg-purple-50 justify-center">
            <span className="text-primary">Drop files or</span>
            <button
              className="ml-2 px-4 py-1 bg-primary text-white rounded hover:bg-primary text-sm flex items-center gap-1 shadow"
              onClick={() => document.getElementById("attachment-upload-input").click()}
              type="button"
            >
              <UploadCloud className="w-4 h-4" /> Browse
            </button>
          </div>
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search an attachment"
              className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-purple-50 text-purple-900"
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-purple-100">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-2 font-semibold text-primary">File name</th>
                <th className="px-4 py-2 font-semibold text-primary">File type</th>
                <th className="px-4 py-2 font-semibold text-primary">Creation date</th>
                <th className="px-4 py-2 font-semibold text-primary">Uploaded by</th>
                <th className="px-4 py-2 font-semibold text-primary">Times downloaded</th>
                <th className="px-4 py-2 font-semibold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder row */}
              <tr>
                <td colSpan={6} className="text-center py-8 text-secondary font-semibold">
                  Attachments will appear here
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="text-lg font-bold text-gray-900">{value}</div>
  </div>
);

export default MemberProfile;
