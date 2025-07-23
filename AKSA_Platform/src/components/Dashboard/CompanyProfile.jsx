import Sidebar from "./Sidebar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const CompanyProfile = () => {
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

  return (
    <div className="flex h-screen font-sans overflow-hidden">
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col h-screen">
        <header className="sticky top-0 z-10">
          <Header />
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Profile Header */}
          <section className="bg-white rounded-lg shadow p-8 mb-8">
            <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md mr-6">
                <img
                  src={profileData.logo}
                  alt="Company Logo"
                  className="w-16 h-16 rounded-xl"
                />
              </div>
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="text-3xl font-bold text-gray-800 bg-transparent focus:outline-none"
                />
                <input
                  type="text"
                  name="industry"
                  value={profileData.industry}
                  onChange={handleChange}
                  className="text-lg text-primary bg-transparent focus:outline-none mt-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                name="description"
                value={profileData.description}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 focus:outline-none"
                rows="3"
              />
            </div>
          </section>

          {/* Company Information */}
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Founding Year", name: "foundingYear", type: "number" },
                { label: "Headquarters", name: "headquarters", type: "text" },
                { label: "Employee Count", name: "employeeCount", type: "number" },
                { label: "Annual Revenue", name: "annualRevenue", type: "text" },
                { label: "Primary Markets", name: "primaryMarkets", type: "text" },
                { label: "Security Certifications", name: "securityCertifications", type: "text" },
              ].map((field) => (
                <div key={field.name} className="bg-gray-50 p-4 rounded-lg border  border-gray-200">
                  <label className="block text-sm font-semibold mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={profileData[field.name]}
                    onChange={handleChange}
                    className="w-full p-2 border  border-gray-200 rounded-lg focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Leadership Team */}
            <section className="col-span-1 bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Leadership Team</h3>
              {loadingMembers ? (
                <p className="text-blue-600 text-center py-4">Loading members...</p>
              ) : membersError ? (
                <p className="text-red-600 text-center py-4">{membersError}</p>
              ) : (
                <>
                  <textarea
                    value={profileData.teamMembers.join("\n")}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        teamMembers: e.target.value.split("\n").filter(Boolean),
                      }))
                    }
                    className="w-full bg-gray-50 border  border-gray-200 rounded-lg p-3 focus:outline-none"
                    rows="6"
                  />
                  <div className="mt-6 space-y-3">
                    {profileData.teamMembers.map((member, i) => (
                      <div key={i} className="bg-indigo-50 p-4 rounded-lg">
                        <input
                          value={member}
                          onChange={(e) => handleArrayChange("teamMembers", i, e.target.value)}
                          className="w-full bg-transparent border-b pb-1"
                        />
                        <span className="text-xs text-primary">
                          {member.split(" - ")[1] || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            <div className="col-span-2 space-y-8">
              {/* Priorities */}
              <section className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Technology Priorities</h3>
                <textarea
                  value={profileData.priorities.join("\n")}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      priorities: e.target.value.split("\n").filter(Boolean),
                    }))
                  }
                  className="w-full bg-gray-50 border  border-gray-200 rounded-lg p-3 focus:outline-none"
                  rows="4"
                />
                <div className="mt-6 space-y-3">
                  {profileData.priorities.map((p, i) => (
                    <input
                      key={i}
                      value={p}
                      onChange={(e) => handleArrayChange("priorities", i, e.target.value)}
                      className="w-full bg-green-50 p-3 rounded-lg border  border-gray-200"
                    />
                  ))}
                </div>
              </section>

              {/* Metrics */}
              <section className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-6">Company Metrics</h3>
                <div className="flex justify-around">
                  {Object.entries(profileData.metrics).map(([key, val]) => (
                    <div key={key} className="text-center bg-indigo-50 p-4 rounded-lg">
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleMetricChange(key, e.target.value)}
                        className="text-3xl font-bold w-16 bg-transparent text-center"
                      />
                      <p className="capitalize mt-2">{key}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Service Providers */}
          <section className="bg-white rounded-lg shadow p-6 mt-8">
            <h3 className="text-xl font-bold mb-6">Service Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <textarea
                name="info"
                value={profileData.serviceProviders.info}
                onChange={handleServiceProviderChange}
                className="bg-purple-50 p-4 rounded-lg border  border-gray-200 focus:outline-none"
                rows="4"
              />
              <input
                name="primary"
                value={profileData.serviceProviders.primary}
                onChange={handleServiceProviderChange}
                className="bg-white rounded-lg border  border-gray-200 p-2 focus:outline-none"
              />
              <input
                name="secondary"
                value={profileData.serviceProviders.secondary}
                onChange={handleServiceProviderChange}
                className="bg-white rounded-lg border border-gray-200 p-2 focus:outline-none"
              />
              <textarea
                name="additionalText"
                value={profileData.serviceProviders.additionalText}
                onChange={handleServiceProviderChange}
                className="bg-white rounded-lg border border-gray-200 p-3 focus:outline-none"
                rows="4"
              />
            </div>
          </section>

          {/* Save & Cancel Buttons */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-600 mr-4"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-100 border"
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
