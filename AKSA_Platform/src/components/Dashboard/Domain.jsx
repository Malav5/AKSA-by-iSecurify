import React, { useEffect, useState } from "react";
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
} from "../DashboardServices";
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
} from "lucide-react";

const InfoRow = ({ title, value }) => (
  <div className="flex justify-between py-1 border-b border-gray-100">
    <span className="font-medium text-gray-700">{title}</span>
    <span className="text-gray-900 text-right max-w-xs truncate">{value}</span>
  </div>
);

const SectionCard = ({ title, icon: Icon, color, children }) => (
  <div className="bg-white p-5 rounded-xl shadow">
    <div
      className={`flex items-center gap-2 mb-4 font-semibold text-lg ${color}`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const Domain = ({ domain }) => {
  const [whois, setWhois] = useState(null);

  useEffect(() => {
    if (!domain) return;

    const loadWhois = async () => {
      try {
        setLoading(true);
        const data = await fetchWhoisData(domain);
        if (data) {
          setWhois(data);
        } else {
          console.warn("No WHOIS data found for:", domain);
        }
      } catch (err) {
        console.error("Failed to load WHOIS:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWhois();
  }, [domain]);

  const [ssl, setSSL] = useState(null);

  useEffect(() => {
    if (!domain) return;
    fetchSSLDetails(domain)
      .then((data) => setSSL(data))
      .catch((err) => console.error(err));
  }, [domain]);

  const [dns, setDNS] = useState(null);

  useEffect(() => {
    if (!domain) return;

    const loadDNS = async () => {
      try {
        const data = await fetchDNSDetails(domain);
        setDNS(data);
      } catch (err) {
        console.error("Failed to fetch DNS data:", err);
      }
    };

    loadDNS();
  }, [domain]);

  const [httpHeaders, setHttpHeaders] = useState(null);
  const [httpSecurity, setHttpSecurity] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [headersData, securityData] = await Promise.all([
          fetchHttpHeaders(domain),
          fetchHttpSecurity(domain),
        ]);
        setHttpHeaders(headersData);
        setHttpSecurity(securityData);
      } catch (error) {
        console.error("Error fetching HTTP data:", error);
      }
    };

    if (domain) {
      fetchData();
    }
  }, [domain]);

  const [tlsData, setTlsData] = useState(null);

  useEffect(() => {
    const fetchtlsInfo = async () => {
      try {
        const res = await fetchTlsInfo(domain); // domain = 'forensiccybertech.com'
        setTlsData(res);
      } catch (err) {
        console.error("Failed to fetch TLS info:", err);
      }
    };

    fetchtlsInfo();
  }, [domain]);

  const [linkedPages, setLinkedPages] = useState({
    internal: [],
    external: [],
  });
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchLinkedPages(domain);
        setLinkedPages({
          internal: data.internal || [],
          external: data.external || [],
        });
      } catch (err) {
        console.error("Error fetching linked pages", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [domain]);

  const [carbonData, setCarbonData] = useState(null);
  useEffect(() => {
    async function loadCarbonData() {
      try {
        const data = await fetchCarbonData(domain);
        setCarbonData(data);
      } catch (error) {
        console.error("Error fetching carbon data", error);
      } finally {
        setLoading(false);
      }
    }
    loadCarbonData();
  }, [domain]);

  const stats = carbonData?.statistics || {};
  const co2 = stats?.co2 || {};
  const grid = co2?.grid || {};
  const renewable = co2?.renewable || {};

  const [socialTags, setSocialTags] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tags = await fetchSocialTags(domain);
        setSocialTags(tags);
      } catch (err) {
        console.error("Error fetching social tags:", err);
      }
    };

    if (domain) fetchData();
  }, [domain]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 👇 Beautiful Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-fade-in text-center text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium">Fetching domain insights...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }
  if (loading) return <div>Loading WHOIS data...</div>;
  if (!whois) return <div>No WHOIS data found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 mx-auto text-sm">
      <SectionCard title="Registrar & WHOIS" icon={Globe} color="text-blue-600">
        <InfoRow title="Registrar" value={whois.Registrar || "N/A"} />
        <InfoRow title="Domain" value={whois.Domain_Name || "N/A"} />
        <InfoRow title="Created On" value={whois.Creation_Date || "N/A"} />
        <InfoRow
          title="Expires On"
          value={whois.Registry_Expiry_Date || "N/A"}
        />
        {whois.DNSSEC && <InfoRow title="DNSSEC" value={whois.DNSSEC} />}
        <InfoRow title="Status" value={whois.Domain_Status || "N/A"} />
      </SectionCard>

      <SectionCard title="SSL Certificate" icon={Lock} color="text-green-600">
        <InfoRow title="Valid From" value={ssl?.valid_from || "N/A"} />
        <InfoRow title="Valid To" value={ssl?.valid_to || "N/A"} />
        <InfoRow title="Issuer" value={ssl?.issuer?.CN || "N/A"} />
        <InfoRow title="Subject CN" value={ssl?.subject?.CN || "N/A"} />
        <InfoRow title="Serial Number" value={ssl?.serialNumber || "N/A"} />
        <InfoRow
          title="Fingerprint (SHA-256)"
          value={ssl?.fingerprint256 || "N/A"}
        />
      </SectionCard>

      <SectionCard title="DNS Info" icon={Server} color="text-red-600">
        <InfoRow title="IPv4 (A Record)" value={dns?.A?.address || "N/A"} />
        <InfoRow
          title="IPv6 (AAAA Record)"
          value={(dns?.AAAA || []).join(", ") || "N/A"}
        />
        <InfoRow
          title="MX Records"
          value={(dns?.MX || []).join(", ") || "N/A"}
        />
        <InfoRow
          title="CNAME Records"
          value={(dns?.CNAME || []).join(", ") || "N/A"}
        />
        <InfoRow
          title="NS Records"
          value={(dns?.NS || []).flat().join(", ") || "N/A"}
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

      <SectionCard title="HTTP Headers" icon={Network} color="text-purple-600">
        <InfoRow title="Server" value={httpHeaders?.server || "N/A"} />
        <InfoRow
          title="Powered By"
          value={httpHeaders?.["x-powered-by"] || "N/A"}
        />
        <InfoRow
          title="Content Type"
          value={httpHeaders?.["content-type"] || "N/A"}
        />
        <InfoRow
          title="Content Security Policy"
          value={httpHeaders?.["content-security-policy"] || "N/A"}
        />
        <InfoRow
          title="LiteSpeed Cache"
          value={httpHeaders?.["x-litespeed-cache"] || "N/A"}
        />
        <InfoRow title="Platform" value={httpHeaders?.platform || "N/A"} />

        <InfoRow
          title="Keep-Alive"
          value={httpHeaders?.["keep-alive"] || "N/A"}
        />

        {/* <InfoRow
          title="Content Length"
          value={httpHeaders?.["content-length"] || "N/A"}
        /> */}
        <InfoRow title="Date" value={httpHeaders?.date || "N/A"} />
      </SectionCard>

      <SectionCard title="TLS Details" icon={Mail} color="text-yellow-600">
        <InfoRow title="TLS ID" value={tlsData?.id || "N/A"} />
        <InfoRow title="Target" value={tlsData?.target || "N/A"} />
        <InfoRow title="Timestamp" value={tlsData?.timestamp || "N/A"} />
        <InfoRow title="TLS Enabled" value={tlsData?.has_tls ? "Yes" : "No"} />
        <InfoRow
          title="Certificate Valid"
          value={tlsData?.is_valid ? "Yes" : "No"}
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
        <InfoRow title="Certificate ID" value={tlsData?.cert_id ?? "N/A"} />
        <InfoRow title="Trust ID" value={tlsData?.trust_id ?? "N/A"} />
        <InfoRow title="Acknowledged" value={tlsData?.ack ? "Yes" : "No"} />
        <InfoRow title="Attempts" value={tlsData?.attempts ?? "N/A"} />
      </SectionCard>

      <SectionCard title="Linked Pages" icon={Folder} color="text-indigo-600">
        <div
          className="max-h-80 overflow-y-auto pr-4 pl-4 scrollbar-hide"
          style={{ scrollbarWidth: "thin" }} // for Firefox thin scrollbar
        >
          <h4 className="font-semibold mt-2 mb-2">Internal Pages:</h4>
          {linkedPages.internal.length === 0 ? (
            <div className="pl-2 text-gray-500">No internal pages found</div>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-gray-800">
              {linkedPages.internal.map((url, i) => (
                <li key={`internal-${i}`} className="break-words">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-indigo-700 hover:underline"
                    title={url}
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ol>
          )}

          <h4 className="font-semibold mt-6 mb-2">External Pages:</h4>
          {linkedPages.external.length === 0 ? (
            <div className="pl-2 text-gray-500">No external pages found</div>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-gray-800">
              {linkedPages.external.map((url, i) => (
                <li key={`external-${i}`} className="break-words">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="texy-black hover:text-indigo-700 hover:underline"
                    title={url}
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Carbon Footprint" icon={Globe} color="text-pink-600">
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
          value={carbonData?.statistics?.co2?.renewable?.litres ?? "N/A"}
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
        />
      </SectionCard>

      <SectionCard title="Social Tags" icon={ShieldCheck} color="text-cyan-600">
        <InfoRow title="Title" value={socialTags?.title || "N/A"} />
        <InfoRow title="Description" value={socialTags?.description || "N/A"} />
        <InfoRow title="Keywords" value={socialTags?.keywords || "N/A"} />
        <InfoRow
          title="Canonical URL"
          value={socialTags?.canonicalUrl || "N/A"}
        />

        <InfoRow
          title="Twitter Card"
          value={socialTags?.twitterCard || "N/A"}
        />
        <InfoRow title="Robots" value={socialTags?.robots || "N/A"} />
        <InfoRow title="Viewport" value={socialTags?.viewport || "N/A"} />
        <InfoRow title="Favicon" value={socialTags?.favicon || "N/A"} />
      </SectionCard>
    </div>
  );
};

export default Domain;
