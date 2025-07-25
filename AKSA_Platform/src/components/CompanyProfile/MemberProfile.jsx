// MemberProfile.jsx
import React, { useEffect, useState } from "react";
import { userServices } from "../../services/UserServices";
import { domainServices } from "../../services/domainServices";
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
      {/* Company Info Card */}
      <section className={`${cardBg} rounded-lg shadow p-8 mb-8 ${border}`}>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-primary">
          <span className="inline-block w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path
                d="M2.5 13.5v-2A2.5 2.5 0 0 1 5 9h6a2.5 2.5 0 0 1 2.5 2.5v2M8 7A2.5 2.5 0 1 0 8 2a2.5 2.5 0 0 0 0 5Z"
                stroke="#7C3AED"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Your company information
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center mb-2 relative overflow-hidden border-4 border-purple-200">
              <img
                src={profileData.logo}
                alt="Company Logo"
                className="object-cover w-full h-full"
              />
            </div>
            <input
              id="logo-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <div className="flex gap-2 mt-2">
              <button
                className="px-4 py-1 bg-primary text-white rounded hover:bg-primary text-sm flex items-center gap-1 shadow"
                onClick={() =>
                  document.getElementById("logo-upload-input").click()
                }
                type="button"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    d="M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13.5 14v-1.25A2.75 2.75 0 0 0 10.75 10h-5.5A2.75 2.75 0 0 0 2.5 12.75V14"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Upload
              </button>
            </div>
            <span className="text-xs text-purple-400 mt-1">
              Max image size 800kbs
            </span>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div>
              <div className="text-xs text-gray-500 mb-1">Company name</div>
              <div className="text-lg font-bold text-gray-900">
                {companyName}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Customer code</div>
              <div className="text-lg font-bold text-gray-900">ALL</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">
                Number of Employees
              </div>
              <div className="text-lg font-bold text-gray-900">-</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Expected Devices</div>
              <div className="text-lg font-bold text-gray-900">0</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Member Domains</div>
              <div className="text-lg font-bold text-gray-900">
                {domainCount}{" "}
                <span
                  className="text-primary underline cursor-pointer ml-2 text-sm"
                  onClick={() => setShowDomainsInline(true)}
                >
                  View my domains
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Company Status</div>
              <div className="text-lg font-bold text-primary">
                {userPlan || "-"}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Attachments Section */}
      <section className={`${cardBg} rounded-lg shadow p-8 mb-8 ${border}`}>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-primary">
          <span className="inline-block w-5 h-5 bg-secondary text-primary rounded-full flex items-center justify-center mr-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path
                d="M2.5 13.5v-2A2.5 2.5 0 0 1 5 9h6a2.5 2.5 0 0 1 2.5 2.5v2M8 7A2.5 2.5 0 1 0 8 2a2.5 2.5 0 0 0 0 5Z"
                stroke="#7C3AED"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Attachments (0)
        </h2>
        <input
          id="attachment-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAttachmentChange}
        />
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1 flex items-center border-2 border-dashed border-dashed rounded-lg p-4 bg-purple-50 justify-center">
            <span className="text-primary">Drop files or</span>
            <button
              className="ml-2 px-4 py-1 bg-primary text-white rounded hover:bg-primary text-sm flex items-center gap-1 shadow"
              onClick={() =>
                document.getElementById("attachment-upload-input").click()
              }
              type="button"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path
                  d="M8 3v7m0 0l-2.5-2.5M8 10l2.5-2.5M3 13h10"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Browse
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
                <th className="px-4 py-2 font-semibold text-primary">
                  File name
                </th>
                <th className="px-4 py-2 font-semibold text-primary">
                  File type
                </th>
                <th className="px-4 py-2 font-semibold text-primary">
                  Creation date
                </th>
                <th className="px-4 py-2 font-semibold text-primary">
                  Uploaded by
                </th>
                <th className="px-4 py-2 font-semibold text-primary">
                  Times downloaded
                </th>
                <th className="px-4 py-2 font-semibold text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder row */}
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-secondary font-semibold"
                >
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
