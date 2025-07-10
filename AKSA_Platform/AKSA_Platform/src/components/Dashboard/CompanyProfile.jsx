import Sidebar from "./Sidebar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const CompanyProfile = () => {
  const [profileData, setProfileData] = useState({
    logo: "/logo2.png",
    name: "Allianz Cloud",
    industry: "IT & Cloud Infrastructure Services ",
    description:
      "Allianz Cloud India provides cutting-edge cloud infrastructure and IT solutions tailored for businesses seeking scalability, security, and digital innovation. Their services empower enterprises with reliable, compliant, and high-performance cloud environments.",
    teamMembers: [], // will be fetched
    priorities: [
      "Enhanced Data Security & Privacy Compliance",
      "Seamless System Integration Capabilities",
      "Scalable Cloud Infrastructure",
    ],
    metrics: { customers: 87, countries: 14, partners: 32 },
    serviceProviders: {
      info: "Our trusted cybersecurity and technology service providers that help us maintain security, compliance, and operational excellence.",
      primary: "iSecurify - Cybersecurity Solutions",
      secondary: "CloudTech - Infrastructure Services",
      additionalText:
        "We continuously evaluate our service providers to ensure best-in-class support for our operations.",
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

  const navigate = useNavigate();

  useEffect(() => {
    setLoadingMembers(true);
    setMembersError(null);
    fetch("http://localhost:3000/api/get-members")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then((data) => {
        // Expecting data.members to be an array of strings like "Name - Role"
        setProfileData((prev) => ({ ...prev, teamMembers: data.members || [] }));
        setLoadingMembers(false);
      })
      .catch((err) => {
        setMembersError(err.message || "Error fetching members");
        setLoadingMembers(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamMemberChange = (index, value) => {
    setProfileData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? value : member
      ),
    }));
  };

  const handlePriorityChange = (index, value) => {
    setProfileData((prev) => ({
      ...prev,
      priorities: prev.priorities.map((priority, i) =>
        i === index ? value : priority
      ),
    }));
  };

  const handleMetricChange = (key, value) => {
    setProfileData((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [key]: parseInt(value) || 0,
      },
    }));
  };

  const handleServiceProviderChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      serviceProviders: {
        ...prev.serviceProviders,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Client Profile Data:", profileData);
    // Replace with API call to save data (e.g., POST to /api/client-profile)
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden">
      {/* Sticky Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10">
          <Header />
        </div>
        
        {/* Scrollable Main Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            {/* Logo and Company Name */}
            <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md mr-6">
                <img
                  src={profileData.logo}
                  alt="Company Logo"
                  className="w-16 h-16 rounded-xl"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="text-3xl font-bold text-gray-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 rounded px-2 w-full"
                />
                <input
                  type="text"
                  name="industry"
                  value={profileData.industry}
                  onChange={handleChange}
                  className="text-lg text-primary bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 rounded px-2 w-full mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                name="description"
                value={profileData.description}
                onChange={handleChange}
                className="text-gray-600 w-full bg-gray-50 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                rows="3"
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Company Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Founding Year
                </label>
                <input
                  type="number"
                  name="foundingYear"
                  value={profileData.foundingYear}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Headquarters
                </label>
                <input
                  type="text"
                  name="headquarters"
                  value={profileData.headquarters}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Employee Count
                </label>
                <input
                  type="number"
                  name="employeeCount"
                  value={profileData.employeeCount}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Annual Revenue
                </label>
                <input
                  type="text"
                  name="annualRevenue"
                  value={profileData.annualRevenue}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Primary Markets
                </label>
                <input
                  type="text"
                  name="primaryMarkets"
                  value={profileData.primaryMarkets}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Security Certifications
                </label>
                <input
                  type="text"
                  name="securityCertifications"
                  value={profileData.securityCertifications}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Leadership Team */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow p-6 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Leadership Team
                  </h3>
                </div>
                {loadingMembers ? (
                  <div className="text-blue-600 text-center py-4">Loading members...</div>
                ) : membersError ? (
                  <div className="text-red-600 text-center py-4">{membersError}</div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team Members (one per line)
                      </label>
                      <textarea
                        name="teamMembersText"
                        value={profileData.teamMembers.join("\n")}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            teamMembers: e.target.value
                              .split("\n")
                              .filter((s) => s),
                          }))
                        }
                        className="text-gray-600 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        rows="6"
                        disabled={loadingMembers}
                      />
                    </div>
                    <div className="space-y-3 mt-6">
                      {profileData.teamMembers.map((member, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg shadow-sm border border-indigo-100"
                        >
                          <input
                            type="text"
                            value={member}
                            onChange={(e) =>
                              handleTeamMemberChange(index, e.target.value)
                            }
                            className="text-sm font-medium text-gray-800 bg-transparent border-b border-indigo-200 focus:outline-none focus:border-indigo-500 w-full pb-1 mb-1"
                            disabled={loadingMembers}
                          />
                          <p className="text-xs text-primary font-medium">
                            {member.split(" - ")[1] || ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Technology Priorities and Metrics */}
            <div className="col-span-2">
              {/* Technology Priorities */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Technology Priorities
                  </h3>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorities (one per line)
                  </label>
                  <textarea
                    name="prioritiesText"
                    value={profileData.priorities.join("\n")}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        priorities: e.target.value.split("\n").filter((a) => a),
                      }))
                    }
                    className="text-gray-600 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                    rows="4"
                  />
                </div>

                <ul className="space-y-3 mt-6">
                  {profileData.priorities.map((priority, index) => (
                    <li
                      key={index}
                      className="flex items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100 shadow-sm"
                    >
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                      <input
                        type="text"
                        value={priority}
                        onChange={(e) =>
                          handlePriorityChange(index, e.target.value)
                        }
                        className="text-sm text-gray-700 bg-transparent border-b border-green-200 focus:outline-none focus:border-green-500 w-full"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Metrics */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Company Metrics
                  </h3>
                </div>

                <div className="flex justify-around">
                  {Object.keys(profileData.metrics).map((key) => (
                    <div
                      key={key}
                      className="text-center bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100"
                    >
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#blue-gradient)"
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={
                              283 - (profileData.metrics[key] / 100) * 283 || 0
                            }
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient
                              id="blue-gradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#800080" />
                              <stop offset="100%" stopColor="#4f46e5" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <input
                            type="number"
                            value={profileData.metrics[key]}
                            onChange={(e) =>
                              handleMetricChange(key, e.target.value)
                            }
                            className="text-3xl font-bold text-black bg-transparent focus:outline-none w-16 text-center"
                          />
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 mt-2 capitalize bg-white py-1 px-4 rounded-full border border-gray-200 shadow-sm">
                        {key}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Providers Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Service Providers
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Provider Information
                </label>
                <textarea
                  name="info"
                  value={profileData.serviceProviders.info}
                  onChange={handleServiceProviderChange}
                  className="text-gray-600 text-sm w-full bg-white/80 border border-purple-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                  rows="4"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Provider
                  </label>
                  <input
                    type="text"
                    name="primary"
                    value={profileData.serviceProviders.primary}
                    onChange={handleServiceProviderChange}
                    className="text-gray-700 text-sm w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Provider
                  </label>
                  <input
                    type="text"
                    name="secondary"
                    value={profileData.serviceProviders.secondary}
                    onChange={handleServiceProviderChange}
                    className="text-gray-700 text-sm w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalText"
                  value={profileData.serviceProviders.additionalText}
                  onChange={handleServiceProviderChange}
                  className="text-gray-600 text-sm w-full h-30 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-[#800080] to-[#800080] text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium text-lg mr-4"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow border border-gray-300 font-medium text-lg"
            >
              Cancel
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyProfile;