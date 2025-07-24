import React, { useEffect, useState, useRef } from "react";
import { fetchWhoisData, fetchSSLDetails, fetchDNSDetails, fetchHttpHeaders, fetchHttpSecurity, fetchTlsInfo, fetchLinkedPages, fetchCarbonData, fetchSocialTags } from "../services/DashboardServices";
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
  Copy
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";

// Use a separate key for Domain Details page
const DOMAIN_DETAIL_KEY = "domainDetailSelectedDomain";

// Tooltip component
const Tooltip = ({ text, children }) => (
    <span className="relative group cursor-pointer">
        {children}
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-20 whitespace-nowrap">
            {text}
        </span>
    </span>
);

// Enhanced InfoRow without copy support
const InfoRow = ({ title, value, badge, tooltip }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-gray-100 group">
        <div className="flex items-center gap-1 mb-1 sm:mb-0">
            {tooltip ? (
                <Tooltip text={tooltip}>
                    <span className="font-medium text-gray-700 underline decoration-dotted text-xs sm:text-sm">{title}</span>
                </Tooltip>
            ) : (
                <span className="font-medium text-gray-700 text-xs sm:text-sm">{title}</span>
            )}
            {badge && (
                <span className={`ml-2 px-1 sm:px-2 py-0.5 rounded text-xs font-semibold ${badge.color} bg-opacity-10`}>
                    {badge.text}
                </span>
            )}
        </div>
        <div className="flex items-center max-w-full sm:max-w-xs text-left sm:text-right truncate">
            <span className="text-gray-900 truncate text-xs sm:text-sm">{value}</span>
        </div>
    </div>
);

const SectionCard = ({ title, icon: Icon, color, children }) => (
  <div className="bg-white p-4 sm:p-5 rounded-xl shadow transition-shadow duration-200 hover:shadow-lg">
    <div className={`flex items-center gap-2 mb-3 sm:mb-4 font-semibold text-base sm:text-lg ${color}`}>
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
      <span className="truncate">{title}</span>
    </div>
    <div className="text-xs sm:text-sm">{children}</div>
  </div>
);

const DomainDetail = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Always default to no domain selected on page load
    const [selected, setSelected] = useState("");

    // Get domain from location state or localStorage (Domain Details only)
    const initialDomain = location.state?.domain || localStorage.getItem(DOMAIN_DETAIL_KEY);

    // State for all domain data
    const [whois, setWhois] = useState(null);
    const [ssl, setSSL] = useState(null);
    const [dns, setDNS] = useState(null);
    const [httpHeaders, setHttpHeaders] = useState(null);
    const [httpSecurity, setHttpSecurity] = useState(null);
    const [tlsData, setTlsData] = useState(null);
    const [linkedPages, setLinkedPages] = useState({ internal: [], external: [] });
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
                        ? data.filter(d => d.userEmail === currentUser)
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
                        socialTagsData
                    ] = await Promise.all([
                        fetchWhoisData(selected),
                        fetchSSLDetails(selected),
                        fetchDNSDetails(selected),
                        fetchHttpHeaders(selected),
                        fetchHttpSecurity(selected),
                        fetchTlsInfo(selected),
                        fetchLinkedPages(selected),
                        fetchCarbonData(selected),
                        fetchSocialTags(selected)
                    ]);

                    setWhois(whoisData);
                    setSSL(sslData);
                    setDNS(dnsData);
                    setHttpHeaders(headersData);
                    setHttpSecurity(securityData);
                    setTlsData(tlsInfo);
                    setLinkedPages(linkedPagesData);
                    setCarbonData(carbonInfo);
                    setSocialTags(socialTagsData);
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
            alert("User email not found. Please log in again.");
            return;
        }
        try {
            const data = await domainServices.addDomain({ name: newDomain, userEmail });
            if (!domainList.some(d => d.name === newDomain)) {
                setDomainList(prev => [...prev, data]);
            }
            setNewDomain("");
            localStorage.setItem(DOMAIN_DETAIL_KEY, data.name);
            setSelected(data.name);
        } catch (err) {
            console.error(err);
            alert("Failed to add domain");
        }
    };

    // Handle deleting domain (Domain Details only)
    const handleDeleteDomain = async (domainId) => {
        if (!domainId) return;
        try {
            if (!domainId.startsWith('dashboard-')) {
                await domainServices.deleteDomain(domainId);
            }
            const domainToDelete = domainList.find(d => d._id === domainId);
            if (domainToDelete) {
                setDomainList(prevList => prevList.filter(domain => domain._id !== domainId));
                if (selected === domainToDelete.name) {
                    setSelected("");
                    localStorage.removeItem(DOMAIN_DETAIL_KEY);
                }
            }
            alert("Domain deleted successfully");
        } catch (err) {
            console.error("Error deleting domain:", err);
            alert("Error deleting domain: " + (err.response?.data?.error || err.message));
        }
    };

    if (!selected) {
        return (
            <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
                <div className="sticky top-0 h-screen">
                    <Sidebar />
                </div>
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <div className="sticky top-0 z-10 bg-white">
                        <Header />
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-6">

                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                            >
                                Back to Dashboard
                            </button>
                        </div>

                        <div className="relative max-w-xs" ref={dropdownRef}>
                            <label className="block mb-2 text-sm font-semibold text-gray-800">
                                Select Domain
                            </label>
                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <span>{selected || "Select a domain"}</span>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>

                            {open && (
                                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                    <li
                                        key="no-domain"
                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                                        onClick={() => {
                                            setSelected("");
                                            localStorage.removeItem(DOMAIN_DETAIL_KEY);
                                            // Clear all domain data
                                            setWhois(null);
                                            setSSL(null);
                                            setDNS(null);
                                            setHttpHeaders(null);
                                            setHttpSecurity(null);
                                            setTlsData(null);
                                            setLinkedPages({ internal: [], external: [] });
                                            setCarbonData(null);
                                            setSocialTags(null);
                                            setOpen(false);
                                            // Don't clear domainList, just set loading to false
                                            setLoading(false);
                                        }}
                                    >
                                        <span className="flex-1 italic">No Domain</span>
                                    </li>
                                    {domainList.map((domain) => (
                                        <li
                                            key={domain._id}
                                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <span
                                                className="flex-1"
                                                onClick={() => handleSelect(domain)}
                                            >
                                                {domain.name}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Are you sure you want to delete ${domain.name}?`)) {
                                                        handleDeleteDomain(domain._id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                                aria-label={`Delete domain ${domain.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-4 max-w-xs">
                            <label htmlFor="new-domain" className="block text-sm font-medium text-gray-700">Add New Domain</label>
                            <div className="flex space-x-2 mt-1">
                                <input
                                    id="new-domain"
                                    type="text"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. yourdomain.com"
                                />
                                <button
                                    onClick={handleAddDomain}
                                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 mx-auto text-sm">
                            <SectionCard title="Registrar & WHOIS" icon={Globe} color="text-blue-600">
                                <InfoRow title="Registrar" value={whois?.Registrar || "N/A"} />
                                <InfoRow title="Domain" value={whois?.Domain_Name || "N/A"} />
                                <InfoRow title="Created On" value={whois?.Creation_Date || "N/A"} />
                                <InfoRow title="Expires On" value={whois?.Registry_Expiry_Date || "N/A"} />
                                {whois?.DNSSEC && <InfoRow title="DNSSEC" value={whois.DNSSEC} />}
                                <InfoRow title="Status" value={whois?.Domain_Status || "N/A"} />
                            </SectionCard>

                            <SectionCard title="SSL Certificate" icon={Lock} color="text-green-600">
                                <InfoRow title="Valid From" value={ssl?.valid_from || "N/A"} />
                                <InfoRow title="Valid To" value={ssl?.valid_to || "N/A"} />
                                <InfoRow title="Issuer" value={ssl?.issuer?.CN || "N/A"} />
                                <InfoRow title="Subject CN" value={ssl?.subject?.CN || "N/A"} />
                                <InfoRow title="Serial Number" value={ssl?.serialNumber || "N/A"} />
                                <InfoRow title="Fingerprint (SHA-256)" value={ssl?.fingerprint256 || "N/A"} />
                            </SectionCard>

                            <SectionCard title="DNS Info" icon={Server} color="text-red-600">
                                <InfoRow title="IPv4 (A Record)" value={dns?.A?.address || "N/A"} />
                                <InfoRow title="IPv6 (AAAA Record)" value={(dns?.AAAA || []).join(", ") || "N/A"} />
                                <InfoRow title="MX Records" value={(dns?.MX || []).join(", ") || "N/A"} />
                                <InfoRow title="CNAME Records" value={(dns?.CNAME || []).join(", ") || "N/A"} />
                                <InfoRow title="NS Records" value={(dns?.NS || []).flat().join(", ") || "N/A"} />
                                <InfoRow title="SOA Serial" value={dns?.SRV?.serial?.toString() || "N/A"} />
                                <InfoRow title="SOA Expiry" value={dns?.SRV?.expire + " seconds" || "N/A"} />
                            </SectionCard>

                            <SectionCard title="HTTP Headers" icon={Network} color="text-purple-600">
                                <InfoRow title="Server" value={httpHeaders?.server || "N/A"} />
                                <InfoRow title="Powered By" value={httpHeaders?.["x-powered-by"] || "N/A"} />
                                <InfoRow title="Content Type" value={httpHeaders?.["content-type"] || "N/A"} />
                                <InfoRow title="Content Security Policy" value={httpHeaders?.["content-security-policy"] || "N/A"} />
                                <InfoRow title="LiteSpeed Cache" value={httpHeaders?.["x-litespeed-cache"] || "N/A"} />
                                <InfoRow title="Platform" value={httpHeaders?.platform || "N/A"} />
                                <InfoRow title="Keep-Alive" value={httpHeaders?.["keep-alive"] || "N/A"} />
                                <InfoRow title="Date" value={httpHeaders?.date || "N/A"} />
                            </SectionCard>

                            <SectionCard title="TLS Details" icon={Mail} color="text-yellow-600">
                                <InfoRow title="TLS ID" value={tlsData?.id || "N/A"} />
                                <InfoRow title="Target" value={tlsData?.target || "N/A"} />
                                <InfoRow title="Timestamp" value={tlsData?.timestamp || "N/A"} />
                                <InfoRow title="TLS Enabled" value={tlsData?.has_tls ? "Yes" : "No"} />
                                <InfoRow title="Certificate Valid" value={tlsData?.is_valid ? "Yes" : "No"} />
                                <InfoRow title="Completion Percentage" value={typeof tlsData?.completion_perc === "number" ? `${tlsData.completion_perc}%` : "N/A"} />
                                <InfoRow title="Replay" value={tlsData?.replay ?? "N/A"} />
                                <InfoRow title="Certificate ID" value={tlsData?.cert_id ?? "N/A"} />
                                <InfoRow title="Trust ID" value={tlsData?.trust_id ?? "N/A"} />
                                <InfoRow title="Acknowledged" value={tlsData?.ack ? "Yes" : "No"} />
                                <InfoRow title="Attempts" value={tlsData?.attempts ?? "N/A"} />
                            </SectionCard>

                            <SectionCard title="Linked Pages" icon={Folder} color="text-indigo-600">
                                <div className="max-h-80 overflow-y-auto pr-4 pl-4 scrollbar-hide" style={{ scrollbarWidth: "thin" }}>
                                    <h4 className="font-semibold mt-2 mb-2">Internal Pages:</h4>
                                    <div className="pl-2 text-gray-500">No internal pages found</div>
                                    <h4 className="font-semibold mt-6 mb-2">External Pages:</h4>
                                    <div className="pl-2 text-gray-500">No external pages found</div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Carbon Footprint" icon={Globe} color="text-pink-600">
                                <InfoRow title="Adjusted Bytes" value={carbonData?.statistics?.adjustedBytes ?? "N/A"} />
                                <InfoRow title="Energy" value={carbonData?.statistics?.energy ?? "N/A"} />
                                <InfoRow title="CO2 Grid (grams)" value={carbonData?.statistics?.co2?.grid?.grams ?? "N/A"} />
                                <InfoRow title="CO2 Grid (litres)" value={carbonData?.statistics?.co2?.grid?.litres ?? "N/A"} />
                                <InfoRow title="CO2 Renewable (grams)" value={carbonData?.statistics?.co2?.renewable?.grams ?? "N/A"} />
                                <InfoRow title="CO2 Renewable (litres)" value={carbonData?.statistics?.co2?.renewable?.litres ?? "N/A"} />
                                <InfoRow title="Cleaner Than" value={carbonData?.cleanerThan ?? "N/A"} />
                                <InfoRow title="Rating" value={carbonData?.rating ?? "N/A"} />
                                <InfoRow title="Green" value={carbonData?.green !== undefined ? (carbonData.green ? "Yes" : "No") : "N/A"} />
                            </SectionCard>

                            <SectionCard title="Social Tags" icon={ShieldCheck} color="text-cyan-600">
                                <InfoRow title="Title" value={socialTags?.title || "N/A"} />
                                <InfoRow title="Description" value={socialTags?.description || "N/A"} />
                                <InfoRow title="Keywords" value={socialTags?.keywords || "N/A"} />
                                <InfoRow title="Canonical URL" value={socialTags?.canonicalUrl || "N/A"} />
                                <InfoRow title="Twitter Card" value={socialTags?.twitterCard || "N/A"} />
                                <InfoRow title="Robots" value={socialTags?.robots || "N/A"} />
                                <InfoRow title="Viewport" value={socialTags?.viewport || "N/A"} />
                                <InfoRow title="Favicon" value={socialTags?.favicon || "N/A"} />
                            </SectionCard>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="sticky top-0 z-10 bg-white">
            <Header />
          </div>
          <div className="flex justify-between items-center mb-6 p-4 sm:p-6">
            <h1 className="text-2xl font-bold">Domain Details: {selected}</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              Back to Dashboard
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
            {/* Always show domain selector and add domain input, even while loading */}
            <div className="relative max-w-xs mb-4" ref={dropdownRef}>
              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Select Domain
              </label>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span>{selected || "Select a domain"}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              {open && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                  <li
                    key="no-domain"
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                    onClick={() => {
                      setSelected("");
                      localStorage.removeItem(DOMAIN_DETAIL_KEY);
                      setWhois(null);
                      setSSL(null);
                      setDNS(null);
                      setHttpHeaders(null);
                      setHttpSecurity(null);
                      setTlsData(null);
                      setLinkedPages({ internal: [], external: [] });
                      setCarbonData(null);
                      setSocialTags(null);
                      setOpen(false);
                      setLoading(false);
                    }}
                  >
                    <span className="flex-1 italic">No Domain</span>
                  </li>
                  {domainList && domainList.map((domain) => (
                    <li
                      key={domain._id}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <span
                        className="flex-1"
                        onClick={() => handleSelect(domain)}
                      >
                        {domain.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete ${domain.name}?`)) {
                            handleDeleteDomain(domain._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Delete domain ${domain.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4 max-w-xs mb-8">
              <label htmlFor="new-domain" className="block text-sm font-medium text-gray-700">Add New Domain</label>
              <div className="flex space-x-2 mt-1">
                <input
                  id="new-domain"
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. yourdomain.com"
                />
                <button
                  onClick={handleAddDomain}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in text-center text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium">Fetching domain insights for {selected}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="sticky top-0 z-10 bg-white">
            <Header />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
            {/* Always show domain selector and add domain input, even on error */}
            <div className="relative max-w-xs mb-4" ref={dropdownRef}>
              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Select Domain
              </label>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span>{selected || "Select a domain"}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              {open && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                  <li
                    key="no-domain"
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                    onClick={() => {
                      setSelected("");
                      localStorage.removeItem(DOMAIN_DETAIL_KEY);
                      setWhois(null);
                      setSSL(null);
                      setDNS(null);
                      setHttpHeaders(null);
                      setHttpSecurity(null);
                      setTlsData(null);
                      setLinkedPages({ internal: [], external: [] });
                      setCarbonData(null);
                      setSocialTags(null);
                      setOpen(false);
                      setLoading(false);
                    }}
                  >
                    <span className="flex-1 italic">No Domain</span>
                  </li>
                  {domainList && domainList.map((domain) => (
                    <li
                      key={domain._id}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <span
                        className="flex-1"
                        onClick={() => handleSelect(domain)}
                      >
                        {domain.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete ${domain.name}?`)) {
                            handleDeleteDomain(domain._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Delete domain ${domain.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4 max-w-xs mb-8">
              <label htmlFor="new-domain" className="block text-sm font-medium text-gray-700">Add New Domain</label>
              <div className="flex space-x-2 mt-1">
                <input
                  id="new-domain"
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. yourdomain.com"
                />
                <button
                  onClick={handleAddDomain}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
                <div className="sticky top-0 z-10 bg-white">
                    <Header />
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-4 lg:p-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                            Domain Details{selected ? `: ${selected}` : ""}
                        </h1>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#700070] transition-colors text-sm sm:text-base"
                        >
                            Back to Dashboard
                        </button>
                    </div>

          {/* Domain Selection Section */}
          <div className="space-y-4 sm:space-y-6 mb-6">
            <div className="relative max-w-xs sm:max-w-md" ref={dropdownRef}>
              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Select Domain
              </label>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <span className="truncate">{selected || "Select a domain"}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
              </button>
              {open && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                  <li
                    key="no-domain"
                    className="flex items-center justify-between px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                    onClick={() => {
                      setSelected("");
                      localStorage.removeItem(DOMAIN_DETAIL_KEY);
                      setWhois(null);
                      setSSL(null);
                      setDNS(null);
                      setHttpHeaders(null);
                      setHttpSecurity(null);
                      setTlsData(null);
                      setLinkedPages({ internal: [], external: [] });
                      setCarbonData(null);
                      setSocialTags(null);
                      setOpen(false);
                      setLoading(false);
                    }}
                  >
                    <span className="flex-1 italic">No Domain</span>
                  </li>
                  {domainList.map((domain) => (
                    <li
                      key={domain._id}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <span
                        className="flex-1 truncate"
                        onClick={() => handleSelect(domain)}
                      >
                        {domain.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete ${domain.name}?`)) {
                            handleDeleteDomain(domain._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
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
            <div className="max-w-xs sm:max-w-md">
              <label htmlFor="new-domain" className="block text-sm font-medium text-gray-700 mb-2">
                Add New Domain
              </label>
              <div className="flex space-x-2">
                <input
                  id="new-domain"
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. yourdomain.com"
                />
                <button
                  onClick={handleAddDomain}
                  className="bg-primary text-white px-3 sm:px-4 py-2 rounded hover:bg-[#700070] transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

                    {/* Empty State */}
                    {domainList.length === 0 && (
                        <div className="mt-8 text-center text-gray-500 text-base sm:text-lg font-medium">
                            No domains found. Add a domain to get started.
                        </div>
                    )}

                    {/* Domain Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        <SectionCard title="Registrar & WHOIS" icon={Globe} color="text-blue-600">
                            <InfoRow title="Registrar" value={whois?.Registrar || "N/A"} />
                            <InfoRow title="Domain" value={whois?.Domain_Name || "N/A"} />
                            <InfoRow title="Created On" value={whois?.Creation_Date || "N/A"} />
                            <InfoRow title="Expires On" value={whois?.Registry_Expiry_Date || "N/A"} />
                            {whois?.DNSSEC && <InfoRow title="DNSSEC" value={whois.DNSSEC} />}
                            <InfoRow title="Status" value={whois?.Domain_Status || "N/A"} />
                        </SectionCard>
                        <SectionCard title="SSL Certificate" icon={Lock} color="text-green-600">
                            <InfoRow title="Valid From" value={ssl?.valid_from || "N/A"} />
                            <InfoRow title="Valid To" value={ssl?.valid_to || "N/A"} />
                            <InfoRow title="Issuer" value={ssl?.issuer?.CN || "N/A"} />
                            <InfoRow title="Subject CN" value={ssl?.subject?.CN || "N/A"} />
                            <InfoRow title="Serial Number" value={ssl?.serialNumber || "N/A"} />
                            <InfoRow title="Fingerprint (SHA-256)" value={ssl?.fingerprint256 || "N/A"} />
                        </SectionCard>
                        <SectionCard title="DNS Info" icon={Server} color="text-red-600">
                            <InfoRow title="IPv4 (A Record)" value={dns?.A?.address || "N/A"} />
                            <InfoRow title="IPv6 (AAAA Record)" value={(dns?.AAAA || []).join(", ") || "N/A"} />
                            <InfoRow title="MX Records" value={(dns?.MX || []).join(", ") || "N/A"} />
                            <InfoRow title="CNAME Records" value={(dns?.CNAME || []).join(", ") || "N/A"} />
                            <InfoRow title="NS Records" value={(dns?.NS || []).flat().join(", ") || "N/A"} />
                            <InfoRow title="SOA Serial" value={dns?.SRV?.serial?.toString() || "N/A"} />
                            <InfoRow title="SOA Expiry" value={dns?.SRV?.expire + " seconds" || "N/A"} />
                        </SectionCard>
                        <SectionCard title="HTTP Headers" icon={Network} color="text-purple-600">
                            <InfoRow title="Server" value={httpHeaders?.server || "N/A"} />
                            <InfoRow title="Powered By" value={httpHeaders?.["x-powered-by"] || "N/A"} />
                            <InfoRow title="Content Type" value={httpHeaders?.["content-type"] || "N/A"} />
                            <InfoRow title="Content Security Policy" value={httpHeaders?.["content-security-policy"] || "N/A"} />
                            <InfoRow title="LiteSpeed Cache" value={httpHeaders?.["x-litespeed-cache"] || "N/A"} />
                            <InfoRow title="Platform" value={httpHeaders?.platform || "N/A"} />
                            <InfoRow title="Keep-Alive" value={httpHeaders?.["keep-alive"] || "N/A"} />
                            <InfoRow title="Date" value={httpHeaders?.date || "N/A"} />
                        </SectionCard>
                        <SectionCard title="TLS Details" icon={Mail} color="text-yellow-600">
                            <InfoRow title="TLS ID" value={tlsData?.id || "N/A"} />
                            <InfoRow title="Target" value={tlsData?.target || "N/A"} />
                            <InfoRow title="Timestamp" value={tlsData?.timestamp || "N/A"} />
                            <InfoRow title="TLS Enabled" value={tlsData?.has_tls ? "Yes" : "No"} />
                            <InfoRow title="Certificate Valid" value={tlsData?.is_valid ? "Yes" : "No"} />
                            <InfoRow title="Completion Percentage" value={typeof tlsData?.completion_perc === "number" ? `${tlsData.completion_perc}%` : "N/A"} />
                            <InfoRow title="Replay" value={tlsData?.replay ?? "N/A"} />
                            <InfoRow title="Certificate ID" value={tlsData?.cert_id ?? "N/A"} />
                            <InfoRow title="Trust ID" value={tlsData?.trust_id ?? "N/A"} />
                            <InfoRow title="Acknowledged" value={tlsData?.ack ? "Yes" : "No"} />
                            <InfoRow title="Attempts" value={tlsData?.attempts ?? "N/A"} />
                        </SectionCard>
                        <SectionCard title="Linked Pages" icon={Folder} color="text-indigo-600">
                            <div className="max-h-80 overflow-y-auto pr-4 pl-4 scrollbar-hide" style={{ scrollbarWidth: "thin" }}>
                                <h4 className="font-semibold mt-2 mb-2">Internal Pages:</h4>
                                <div className="pl-2 text-gray-500">No internal pages found</div>
                                <h4 className="font-semibold mt-6 mb-2">External Pages:</h4>
                                <div className="pl-2 text-gray-500">No external pages found</div>
                            </div>
                        </SectionCard>
                        <SectionCard title="Carbon Footprint" icon={Globe} color="text-pink-600">
                            <InfoRow title="Adjusted Bytes" value={carbonData?.statistics?.adjustedBytes ?? "N/A"} />
                            <InfoRow title="Energy" value={carbonData?.statistics?.energy ?? "N/A"} />
                            <InfoRow title="CO2 Grid (grams)" value={carbonData?.statistics?.co2?.grid?.grams ?? "N/A"} />
                            <InfoRow title="CO2 Grid (litres)" value={carbonData?.statistics?.co2?.grid?.litres ?? "N/A"} />
                            <InfoRow title="CO2 Renewable (grams)" value={carbonData?.statistics?.co2?.renewable?.grams ?? "N/A"} />
                            <InfoRow title="CO2 Renewable (litres)" value={carbonData?.statistics?.co2?.renewable?.litres ?? "N/A"} />
                            <InfoRow title="Cleaner Than" value={carbonData?.cleanerThan ?? "N/A"} />
                            <InfoRow title="Rating" value={carbonData?.rating ?? "N/A"} />
                            <InfoRow title="Green" value={carbonData?.green !== undefined ? (carbonData.green ? "Yes" : "No") : "N/A"} />
                        </SectionCard>
                        <SectionCard title="Social Tags" icon={ShieldCheck} color="text-cyan-600">
                            <InfoRow title="Title" value={socialTags?.title || "N/A"} />
                            <InfoRow title="Description" value={socialTags?.description || "N/A"} />
                            <InfoRow title="Keywords" value={socialTags?.keywords || "N/A"} />
                            <InfoRow title="Canonical URL" value={socialTags?.canonicalUrl || "N/A"} />
                            <InfoRow title="Twitter Card" value={socialTags?.twitterCard || "N/A"} />
                            <InfoRow title="Robots" value={socialTags?.robots || "N/A"} />
                            <InfoRow title="Viewport" value={socialTags?.viewport || "N/A"} />
                            <InfoRow title="Favicon" value={socialTags?.favicon || "N/A"} />
                        </SectionCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainDetail;
