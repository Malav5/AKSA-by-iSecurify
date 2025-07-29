import React, { useEffect, useState, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchWhoisData,
  fetchSSLDetails,
  fetchDNSDetails,
  fetchHttpHeaders,
  fetchHttpSecurity,
  fetchTlsInfo,
  fetchLinkedPages,
  fetchCarbonData,
  fetchSocialTags,
} from "../services/DashboardServices";
import { domainServices } from "../services/domainServices";
import {
  Globe,
  Lock,
  Network,
  ShieldCheck,
  Inbox,
  Mail,
  Server,
  Folder,
  Loader2,
  ChevronDown,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  Copy,
  AlertTriangle,
  Clock,
  Shield,
  Activity,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import { showSuccess, showError } from "../components/ui/toast";
import { ToastContainer } from "react-toastify";

// Use a separate key for Domain Details page
const DOMAIN_DETAIL_KEY = "domainDetailSelectedDomain";

// Enhanced Tooltip component
const Tooltip = ({ text, children }) => (
  <span className="relative group cursor-pointer">
    {children}
    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-20 whitespace-nowrap shadow-lg">
      {text}
    </span>
  </span>
);

// Enhanced InfoRow with better styling
const InfoRow = ({ title, value, badge, tooltip, status }) => {
  const getStatusColor = (status) => {
    if (status === 'success' || status === 'valid' || status === 'yes') return 'text-emerald-600';
    if (status === 'error' || status === 'invalid' || status === 'no') return 'text-red-600';
    if (status === 'warning') return 'text-amber-600';
    return 'text-gray-900';
  };

  const getStatusIcon = (status) => {
    if (status === 'success' || status === 'valid' || status === 'yes') return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    if (status === 'error' || status === 'invalid' || status === 'no') return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-1 sm:mb-0">
      {tooltip ? (
        <Tooltip text={tooltip}>
            <span className="font-medium text-gray-700 underline decoration-dotted text-xs sm:text-sm flex items-center gap-1">
            {title}
              <Info className="w-3 h-3 text-gray-400" />
          </span>
        </Tooltip>
      ) : (
        <span className="font-medium text-gray-700 text-xs sm:text-sm">
          {title}
        </span>
      )}
      {badge && (
        <span
            className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${badge.color} bg-opacity-10 border border-opacity-20`}
        >
          {badge.text}
        </span>
      )}
    </div>
      <div className="flex items-center gap-2 max-w-full sm:max-w-xs text-left sm:text-right">
        {getStatusIcon(status)}
        <span className={`truncate text-xs sm:text-sm ${getStatusColor(status)}`}>
          {value}
        </span>
    </div>
  </div>
);
};

// Enhanced SectionCard with gradient backgrounds and better styling
const SectionCard = ({ title, icon: Icon, color, children, gradient = false }) => {
  const getGradientClass = () => {
    if (!gradient) return "bg-white";
    switch (color) {
      case "text-blue-600": return "bg-gradient-to-br from-blue-50 to-indigo-50";
      case "text-green-600": return "bg-gradient-to-br from-emerald-50 to-green-50";
      case "text-red-600": return "bg-gradient-to-br from-red-50 to-pink-50";
      case "text-purple-600": return "bg-gradient-to-br from-purple-50 to-violet-50";
      case "text-yellow-600": return "bg-gradient-to-br from-amber-50 to-yellow-50";
      case "text-indigo-600": return "bg-gradient-to-br from-indigo-50 to-blue-50";
      case "text-pink-600": return "bg-gradient-to-br from-pink-50 to-rose-50";
      case "text-cyan-600": return "bg-gradient-to-br from-cyan-50 to-teal-50";
      default: return "bg-gradient-to-br from-gray-50 to-slate-50";
    }
  };

  return (
    <div className={`${getGradientClass()} p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden min-h-[400px] flex flex-col`}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-12 translate-x-12 opacity-5"></div>
      
      <div className="flex items-center gap-3 mb-4 font-bold text-lg relative z-10">
        <Icon className={`w-6 h-6 ${color}`} />
        <span className="text-gray-800">{title}</span>
      </div>
      <div className="text-xs sm:text-sm relative z-10 flex-1">{children}</div>
    </div>
  );
};

// Enhanced Status Badge component
const StatusBadge = ({ status, text }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'info':
        return 'bg-secondary text-primary border-primary';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {text}
    </span>
  );
};

// Data normalization helper
const normalizeHttpHeaders = (data) => {
  if (!data) return null;
  
  console.log("Normalizing HTTP Headers data:", data);
  
  // If data is already an object, return as is
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }
  
  // If data is an array, try to find headers object
  if (Array.isArray(data)) {
    const headersObj = data.find(item => typeof item === 'object' && item !== null);
    return headersObj || null;
  }
  
  // If data is a string, try to parse it
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return normalizeHttpHeaders(parsed);
    } catch (e) {
      console.warn("Failed to parse HTTP headers string:", e);
      return null;
    }
  }
  
  return null;
};

const normalizeSocialTags = (data) => {
  if (!data) return null;
  
  console.log("Normalizing Social Tags data:", data);
  
  // If data is already an object, return as is
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }
  
  // If data is an array, try to find social tags object
  if (Array.isArray(data)) {
    const tagsObj = data.find(item => typeof item === 'object' && item !== null);
    return tagsObj || null;
  }
  
  // If data is a string, try to parse it
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return normalizeSocialTags(parsed);
    } catch (e) {
      console.warn("Failed to parse social tags string:", e);
      return null;
    }
  }
  
  return null;
};

// Enhanced Domain Selection Component
const DomainSelector = ({ selected, setSelected, domainList, open, setOpen, handleSelect, handleDeleteDomain, newDomain, setNewDomain, handleAddDomain, dropdownRef }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
      <h2 className="text-gray-800 font-bold text-xl">Domain Management</h2>
    </div>
    
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Select Domain */}
      <div className="flex-1 min-w-[200px] max-w-[280px] relative" ref={dropdownRef}>
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          Select Domain
        </label>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all overflow-hidden hover:border-primary"
        >
          <span className="truncate font-medium">
            {selected || "Select a domain"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </button>
        {open && (
          <ul className="absolute left-0 mt-2 min-w-[200px] max-w-[280px] w-full overflow-auto rounded-xl border border-gray-300 bg-white shadow-xl z-20 max-h-60">
            <li
              key="no-domain"
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-500 border-b border-gray-100"
              onClick={() => {
                setSelected("");
                localStorage.removeItem(DOMAIN_DETAIL_KEY);
                setOpen(false);
              }}
            >
              <span className="flex-1 italic">No Domain</span>
            </li>
            {domainList &&
              domainList.map((domain) => (
                <li
                  key={domain._id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <span
                    className="flex-1 font-medium"
                    onClick={() => handleSelect(domain)}
                  >
                    {domain.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${domain.name}?`
                        )
                      ) {
                        handleDeleteDomain(domain._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    aria-label={`Delete domain ${domain.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
          </ul>
        )}
    </div>
      
      {/* Add New Domain */}
      <div className="flex-1 min-w-[200px] max-w-[280px]">
        <label
          htmlFor="new-domain"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Add New Domain
        </label>
        <div className="flex space-x-2">
          <input
            id="new-domain"
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:border-primary"
            placeholder="e.g. yourdomain.com"
          />
          <button
            onClick={handleAddDomain}
            className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
);

const DomainDetail = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Always default to no domain selected on page load
  const [selected, setSelected] = useState("");

  // Get domain from location state or localStorage (Domain Details only)
  const initialDomain =
    location.state?.domain || localStorage.getItem(DOMAIN_DETAIL_KEY);

  // State for all domain data
  const [whois, setWhois] = useState(null);
  const [ssl, setSSL] = useState(null);
  const [dns, setDNS] = useState(null);
  const [httpHeaders, setHttpHeaders] = useState(null);
  const [httpSecurity, setHttpSecurity] = useState(null);
  const [tlsData, setTlsData] = useState(null);
  const [linkedPages, setLinkedPages] = useState({
    internal: [],
    external: [],
  });
  const [carbonData, setCarbonData] = useState(null);
  const [socialTags, setSocialTags] = useState(null);
  const [newDomain, setNewDomain] = useState("");
  const [domainList, setDomainList] = useState([]);
  const [deleteDomainId, setDeleteDomainId] = useState("");
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch domains when component mounts
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await domainServices.fetchDomains();
        if (Array.isArray(data)) {
          const currentUser = localStorage.getItem("currentUser");
          const filteredDomains = currentUser
            ? data.filter((d) => d.userEmail === currentUser)
            : [];
          setDomainList(filteredDomains);
          // If no domains, select 'No Domain'
          if (filteredDomains.length === 0) {
            setSelected("");
            localStorage.removeItem(DOMAIN_DETAIL_KEY);
          }
        }
      } catch (err) {
        console.error("Failed to fetch domain list:", err);
      }
    };

    fetchDomains();
  }, []);

  // If there are no domains, always select 'No Domain' (empty string)
  useEffect(() => {
    if (domainList.length === 0 && selected !== "") {
      setSelected("");
      localStorage.removeItem(DOMAIN_DETAIL_KEY);
    }
  }, [domainList, selected]);

  // Fetch domain data when selected domain changes
  useEffect(() => {
    if (selected) {
      const fetchAllData = async () => {
        try {
          setLoading(true);
          const [
            whoisData,
            sslData,
            dnsData,
            headersData,
            securityData,
            tlsInfo,
            linkedPagesData,
            carbonInfo,
            socialTagsData,
          ] = await Promise.all([
            fetchWhoisData(selected),
            fetchSSLDetails(selected),
            fetchDNSDetails(selected),
            fetchHttpHeaders(selected),
            fetchHttpSecurity(selected),
            fetchTlsInfo(selected),
            fetchLinkedPages(selected),
            fetchCarbonData(selected),
            fetchSocialTags(selected),
          ]);

          console.log("Domain Detail - HTTP Headers Data:", headersData);
          console.log("Domain Detail - Social Tags Data:", socialTagsData);

          setWhois(whoisData);
          setSSL(sslData);
          setDNS(dnsData);
          setHttpHeaders(normalizeHttpHeaders(headersData));
          setHttpSecurity(securityData);
          setTlsData(tlsInfo);
          setLinkedPages(linkedPagesData);
          setCarbonData(carbonInfo);
          setSocialTags(normalizeSocialTags(socialTagsData));
          setError(null);
        } catch (err) {
          console.error("Error fetching domain data:", err);
          setError("Failed to fetch domain data");
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    }
  }, [selected]);

  // Handle selection and navigation (Domain Details only)
  const handleSelect = (domain) => {
    try {
      setSelected(domain.name);
      setOpen(false);
      localStorage.setItem(DOMAIN_DETAIL_KEY, domain.name);
    } catch (error) {
      console.error("Error selecting domain:", error);
      alert("Error selecting domain. Please try again.");
    }
  };

  // Handle adding new domain (Domain Details only)
  const handleAddDomain = async () => {
    if (!newDomain) return;
    const userEmail = localStorage.getItem("currentUser");
    if (!userEmail) {
      showError("User email not found. Please log in again.");
      return;
    }
    try {
      const data = await domainServices.addDomain({
        name: newDomain,
        userEmail,
      });
      if (!domainList.some((d) => d.name === newDomain)) {
        setDomainList((prev) => [...prev, data]);
      }
      setNewDomain("");
      localStorage.setItem(DOMAIN_DETAIL_KEY, data.name);
      setSelected(data.name);
      showSuccess("Domain added successfully!");
    } catch (err) {
      console.error(err);
      showError(err?.response?.data?.error || "Failed to add domain");
    }
  };

  // Handle deleting domain (Domain Details only)
  const handleDeleteDomain = async (domainId) => {
    if (!domainId) return;
    try {
      if (!domainId.startsWith("dashboard-")) {
        await domainServices.deleteDomain(domainId);
      }
      const domainToDelete = domainList.find((d) => d._id === domainId);
      if (domainToDelete) {
        setDomainList((prevList) =>
          prevList.filter((domain) => domain._id !== domainId)
        );
        if (selected === domainToDelete.name) {
          setSelected("");
          localStorage.removeItem(DOMAIN_DETAIL_KEY);
        }
      }
      showSuccess("Domain deleted successfully!");
    } catch (err) {
      console.error("Error deleting domain:", err);
      showError(
        "Error deleting domain: " + (err.response?.data?.error || err.message)
      );
    }
  };

  if (!selected) {
    return (
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="sticky top-0 z-10 bg-white">
            <Header />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-slate-100">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Domain Details
                </h1>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Back to Dashboard
              </button>
            </div>

            <DomainSelector
              selected={selected}
              setSelected={setSelected}
              domainList={domainList}
              open={open}
              setOpen={setOpen}
              handleSelect={handleSelect}
              handleDeleteDomain={handleDeleteDomain}
              newDomain={newDomain}
              setNewDomain={setNewDomain}
              handleAddDomain={handleAddDomain}
              dropdownRef={dropdownRef}
            />

            {/* Empty State */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="bg-gradient-to-r from-[#ee8cee] to-[#e6bfe6] rounded-full p-6 mb-6 inline-block">
                <Globe className="w-12 h-12 text-primary" />
                  </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Domain Selected
              </h3>
              <p className="text-gray-600 mb-6">
                Select a domain from the dropdown above or add a new domain to view detailed information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <StatusBadge status="info" text="Domain Analysis" />
                <StatusBadge status="info" text="Security Insights" />
                <StatusBadge status="info" text="Performance Metrics" />
                  </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
          <div className="sticky top-0 z-10 bg-white">
            <Header />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-slate-100">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                  Domain Details: {selected}
              </h1>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Back to Dashboard
              </button>
            </div>

            <DomainSelector
              selected={selected}
              setSelected={setSelected}
              domainList={domainList}
              open={open}
              setOpen={setOpen}
              handleSelect={handleSelect}
              handleDeleteDomain={handleDeleteDomain}
              newDomain={newDomain}
              setNewDomain={setNewDomain}
              handleAddDomain={handleAddDomain}
              dropdownRef={dropdownRef}
            />

            {/* Loading Spinner/Message */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full p-6 mb-6 inline-block">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Analyzing Domain
              </h3>
              <p className="text-gray-600 mb-4">
                Fetching comprehensive insights for <span className="font-semibold text-purple-600">{selected}</span>
              </p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="sticky top-0 z-10 bg-white">
            <Header />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-slate-100">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                  Domain Details: {selected}
              </h1>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Back to Dashboard
              </button>
            </div>

            <DomainSelector
              selected={selected}
              setSelected={setSelected}
              domainList={domainList}
              open={open}
              setOpen={setOpen}
              handleSelect={handleSelect}
              handleDeleteDomain={handleDeleteDomain}
              newDomain={newDomain}
              setNewDomain={setNewDomain}
              handleAddDomain={handleAddDomain}
              dropdownRef={dropdownRef}
            />

            {/* Error Message */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl relative mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                <div>
                  <strong className="font-bold text-lg">Error!</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <ToastContainer />
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        <div className="sticky top-0 z-10 bg-white">
          <Header />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-slate-100">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Domain Details: {selected}
            </h1>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>

          <DomainSelector
            selected={selected}
            setSelected={setSelected}
            domainList={domainList}
            open={open}
            setOpen={setOpen}
            handleSelect={handleSelect}
            handleDeleteDomain={handleDeleteDomain}
            newDomain={newDomain}
            setNewDomain={setNewDomain}
            handleAddDomain={handleAddDomain}
            dropdownRef={dropdownRef}
          />

          {/* Domain Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <SectionCard
              title="Registrar & WHOIS"
              icon={Globe}
              color="text-blue-600"
              gradient={true}
            >
              <InfoRow title="Registrar" value={whois?.Registrar || "N/A"} />
              <InfoRow title="Domain" value={whois?.Domain_Name || "N/A"} />
              <InfoRow
                title="Created On"
                value={whois?.Creation_Date || "N/A"}
                tooltip="Domain registration date"
              />
              <InfoRow
                title="Expires On"
                value={whois?.Registry_Expiry_Date || "N/A"}
                tooltip="Domain expiration date"
              />
              {whois?.DNSSEC && <InfoRow title="DNSSEC" value={whois.DNSSEC} />}
              <InfoRow title="Status" value={whois?.Domain_Status || "N/A"} />
            </SectionCard>

            <SectionCard
              title="SSL Certificate"
              icon={Lock}
              color="text-green-600"
              gradient={true}
            >
              <InfoRow 
                title="Valid From" 
                value={ssl?.valid_from || "N/A"}
                status={ssl?.valid_from ? 'success' : 'error'}
              />
              <InfoRow 
                title="Valid To" 
                value={ssl?.valid_to || "N/A"}
                status={ssl?.valid_to ? 'success' : 'error'}
              />
              <InfoRow title="Issuer" value={ssl?.issuer?.CN || "N/A"} />
              <InfoRow title="Subject CN" value={ssl?.subject?.CN || "N/A"} />
              <InfoRow
                title="Serial Number"
                value={ssl?.serialNumber || "N/A"}
              />
              <InfoRow
                title="Fingerprint (SHA-256)"
                value={ssl?.fingerprint256 || "N/A"}
              />
            </SectionCard>

            <SectionCard 
              title="DNS Info" 
              icon={Server} 
              color="text-red-600"
              gradient={true}
            >
              <InfoRow
                title="IPv4 (A Record)"
                value={dns?.A?.address || "N/A"}
                status={dns?.A?.address ? 'success' : 'error'}
              />
              <InfoRow
                title="IPv6 (AAAA Record)"
                value={(dns?.AAAA || []).join(", ") || "N/A"}
                status={dns?.AAAA?.length > 0 ? 'success' : 'warning'}
              />
              <InfoRow
                title="MX Records"
                value={(dns?.MX || []).join(", ") || "N/A"}
                status={dns?.MX?.length > 0 ? 'success' : 'warning'}
              />
              <InfoRow
                title="CNAME Records"
                value={(dns?.CNAME || []).join(", ") || "N/A"}
              />
              <InfoRow
                title="NS Records"
                value={(dns?.NS || []).flat().join(", ") || "N/A"}
                status={dns?.NS?.length > 0 ? 'success' : 'error'}
              />
              <InfoRow
                title="SOA Serial"
                value={dns?.SRV?.serial?.toString() || "N/A"}
              />
              <InfoRow
                title="SOA Expiry"
                value={dns?.SRV?.expire + " seconds" || "N/A"}
              />
            </SectionCard>

            <SectionCard
              title="HTTP Headers"
              icon={Network}
              color="text-purple-600"
              gradient={true}
            >
              {console.log("Rendering HTTP Headers with data:", httpHeaders)}
              <InfoRow 
                title="Server" 
                value={
                  httpHeaders?.server || 
                  httpHeaders?.Server || 
                  httpHeaders?.headers?.server ||
                  httpHeaders?.headers?.Server ||
                  "N/A"
                } 
              />
              <InfoRow
                title="Powered By"
                value={
                  httpHeaders?.["x-powered-by"] || 
                  httpHeaders?.["X-Powered-By"] || 
                  httpHeaders?.headers?.["x-powered-by"] ||
                  httpHeaders?.headers?.["X-Powered-By"] ||
                  "N/A"
                }
              />
              <InfoRow
                title="Content Type"
                value={
                  httpHeaders?.["content-type"] || 
                  httpHeaders?.["Content-Type"] || 
                  httpHeaders?.headers?.["content-type"] ||
                  httpHeaders?.headers?.["Content-Type"] ||
                  "N/A"
                }
              />
              <InfoRow
                title="Content Security Policy"
                value={
                  httpHeaders?.["content-security-policy"] || 
                  httpHeaders?.["Content-Security-Policy"] || 
                  httpHeaders?.headers?.["content-security-policy"] ||
                  httpHeaders?.headers?.["Content-Security-Policy"] ||
                  "N/A"
                }
                status={
                  (httpHeaders?.["content-security-policy"] || 
                   httpHeaders?.["Content-Security-Policy"] || 
                   httpHeaders?.headers?.["content-security-policy"] ||
                   httpHeaders?.headers?.["Content-Security-Policy"]) ? 'success' : 'warning'
                }
              />
              <InfoRow
                title="LiteSpeed Cache"
                value={
                  httpHeaders?.["x-litespeed-cache"] || 
                  httpHeaders?.["X-LiteSpeed-Cache"] || 
                  httpHeaders?.headers?.["x-litespeed-cache"] ||
                  httpHeaders?.headers?.["X-LiteSpeed-Cache"] ||
                  "N/A"
                }
              />
              <InfoRow
                title="Platform"
                value={
                  httpHeaders?.platform || 
                  httpHeaders?.Platform || 
                  httpHeaders?.headers?.platform ||
                  httpHeaders?.headers?.Platform ||
                  "N/A"
                }
              />
              <InfoRow
                title="Keep-Alive"
                value={
                  httpHeaders?.["keep-alive"] || 
                  httpHeaders?.["Keep-Alive"] || 
                  httpHeaders?.headers?.["keep-alive"] ||
                  httpHeaders?.headers?.["Keep-Alive"] ||
                  "N/A"
                }
              />
              <InfoRow 
                title="Date" 
                value={
                  httpHeaders?.date || 
                  httpHeaders?.Date || 
                  httpHeaders?.headers?.date ||
                  httpHeaders?.headers?.Date ||
                  "N/A"
                } 
              />
            </SectionCard>

            <SectionCard
              title="TLS Details"
              icon={Mail}
              color="text-yellow-600"
              gradient={true}
            >
              <InfoRow title="TLS ID" value={tlsData?.id || "N/A"} />
              <InfoRow title="Target" value={tlsData?.target || "N/A"} />
              <InfoRow title="Timestamp" value={tlsData?.timestamp || "N/A"} />
              <InfoRow
                title="TLS Enabled"
                value={tlsData?.has_tls ? "Yes" : "No"}
                status={tlsData?.has_tls ? 'success' : 'error'}
              />
              <InfoRow
                title="Certificate Valid"
                value={tlsData?.is_valid ? "Yes" : "No"}
                status={tlsData?.is_valid ? 'success' : 'error'}
              />
              <InfoRow
                title="Completion Percentage"
                value={
                  typeof tlsData?.completion_perc === "number"
                    ? `${tlsData.completion_perc}%`
                    : "N/A"
                }
              />
              <InfoRow title="Replay" value={tlsData?.replay ?? "N/A"} />
              <InfoRow
                title="Certificate ID"
                value={tlsData?.cert_id ?? "N/A"}
              />
              <InfoRow title="Trust ID" value={tlsData?.trust_id ?? "N/A"} />
              <InfoRow
                title="Acknowledged"
                value={tlsData?.ack ? "Yes" : "No"}
                status={tlsData?.ack ? 'success' : 'warning'}
              />
              <InfoRow title="Attempts" value={tlsData?.attempts ?? "N/A"} />
            </SectionCard>

            <SectionCard
              title="Linked Pages"
              icon={Folder}
              color="text-indigo-600"
              gradient={true}
            >
              <div className="space-y-2 h-full flex flex-col">
                <div className="flex-1 min-h-0">
                  <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    Internal Pages
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-1.5 text-gray-500 text-xs h-36 linked-pages-scroll overflow-y-auto">
                    {linkedPages.internal && linkedPages.internal.length > 0 
                      ? linkedPages.internal.map((page, index) => (
                          <div key={index} className="py-0.5 text-xs border-b border-gray-200 last:border-b-0 leading-tight">
                            <span className="text-indigo-600 font-medium">•</span> {page}
                </div>
                        ))
                      : <div className="text-gray-400 italic">No internal pages found</div>
                    }
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    External Pages
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-1.5 text-gray-500 text-xs h-36 linked-pages-scroll overflow-y-auto">
                    {linkedPages.external && linkedPages.external.length > 0 
                      ? linkedPages.external.map((page, index) => (
                          <div key={index} className="py-0.5 text-xs border-b border-gray-200 last:border-b-0 leading-tight">
                            <span className="text-indigo-600 font-medium">•</span> {page}
                          </div>
                        ))
                      : <div className="text-gray-400 italic">No external pages found</div>
                    }
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Carbon Footprint"
              icon={Globe}
              color="text-pink-600"
              gradient={true}
            >
              <InfoRow
                title="Adjusted Bytes"
                value={carbonData?.statistics?.adjustedBytes ?? "N/A"}
              />
              <InfoRow
                title="Energy"
                value={carbonData?.statistics?.energy ?? "N/A"}
              />
              <InfoRow
                title="CO2 Grid (grams)"
                value={carbonData?.statistics?.co2?.grid?.grams ?? "N/A"}
              />
              <InfoRow
                title="CO2 Grid (litres)"
                value={carbonData?.statistics?.co2?.grid?.litres ?? "N/A"}
              />
              <InfoRow
                title="CO2 Renewable (grams)"
                value={carbonData?.statistics?.co2?.renewable?.grams ?? "N/A"}
              />
              <InfoRow
                title="CO2 Renewable (litres)"
                value={
                  carbonData?.statistics?.co2?.renewable?.litres ?? "N/A"
                }
              />
              <InfoRow
                title="Cleaner Than"
                value={carbonData?.cleanerThan ?? "N/A"}
              />
              <InfoRow title="Rating" value={carbonData?.rating ?? "N/A"} />
              <InfoRow
                title="Green"
                value={
                  carbonData?.green !== undefined
                    ? carbonData.green
                      ? "Yes"
                      : "No"
                    : "N/A"
                }
                status={carbonData?.green ? 'success' : 'warning'}
              />
            </SectionCard>

            <SectionCard
              title="Social Tags"
              icon={ShieldCheck}
              color="text-cyan-600"
              gradient={true}
            >
              {console.log("Rendering Social Tags with data:", socialTags)}
              <InfoRow 
                title="Title" 
                value={
                  socialTags?.title || 
                  socialTags?.Title || 
                  socialTags?.tags?.title ||
                  socialTags?.tags?.Title ||
                  "N/A"
                } 
              />
              <InfoRow
                title="Description"
                value={
                  socialTags?.description || 
                  socialTags?.Description || 
                  socialTags?.tags?.description ||
                  socialTags?.tags?.Description ||
                  "N/A"
                }
              />
              <InfoRow 
                title="Keywords" 
                value={
                  socialTags?.keywords || 
                  socialTags?.Keywords || 
                  socialTags?.tags?.keywords ||
                  socialTags?.tags?.Keywords ||
                  "N/A"
                } 
              />
              <InfoRow
                title="Canonical URL"
                value={
                  socialTags?.canonicalUrl || 
                  socialTags?.canonical_url || 
                  socialTags?.CanonicalUrl || 
                  socialTags?.tags?.canonicalUrl ||
                  socialTags?.tags?.canonical_url ||
                  socialTags?.tags?.CanonicalUrl ||
                  "N/A"
                }
              />
              <InfoRow
                title="Twitter Card"
                value={
                  socialTags?.twitterCard || 
                  socialTags?.twitter_card || 
                  socialTags?.TwitterCard || 
                  socialTags?.tags?.twitterCard ||
                  socialTags?.tags?.twitter_card ||
                  socialTags?.tags?.TwitterCard ||
                  "N/A"
                }
              />
              <InfoRow 
                title="Robots" 
                value={
                  socialTags?.robots || 
                  socialTags?.Robots || 
                  socialTags?.tags?.robots ||
                  socialTags?.tags?.Robots ||
                  "N/A"
                } 
              />
              <InfoRow 
                title="Viewport" 
                value={
                  socialTags?.viewport || 
                  socialTags?.Viewport || 
                  socialTags?.tags?.viewport ||
                  socialTags?.tags?.Viewport ||
                  "N/A"
                } 
              />
              <InfoRow 
                title="Favicon" 
                value={
                  socialTags?.favicon || 
                  socialTags?.Favicon || 
                  socialTags?.tags?.favicon ||
                  socialTags?.tags?.Favicon ||
                  "N/A"
                } 
              />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainDetail;

