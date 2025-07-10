import axios from "axios";
// Function to fetch domain data
export const fetchDomainData = async (domainName) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/health?domain=${domainName}`
      );
      return res.data;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
  // Function to fetch domain problems (diagnostics)
  export const fetchDomainProblems = async (domain) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/problems?domain=${domain}`
      );
      return response.data.diagnostics; // Only return the diagnostics array
    } catch (error) {
      console.error("Error fetching domain data:", error);
      return []; // Return an empty array if there's an error
    }
  };
  
  // Function to fetch blacklist data
  export const fetchBlacklistData = async (domain) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/blacklists?domain=${domain}`
      );
      return response.data.details.map((item, index) => ({
        id: index + 1, // Create a unique ID for each blacklist entry
        category: response.data.category,
        domain: response.data.domain,
        blacklistName: item.blacklist,
        listed: item.listed ? "Listed" : "Not Listed", // Convert boolean to readable status
      }));
    } catch (error) {
      console.error("Error fetching blacklist data:", error);
      return []; // Return an empty array if there's an error
    }
  };
  
  // Function to fetch MX records
  export const fetchMxRecords = async (domain) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/mxRecords?domain=${domain}`
      );
  
      const mxRecords = response.data["MX Records"];
  
      if (
        mxRecords.includes("Error: The DNS response does not contain an answer")
      ) {
        return [
          {
            error:
              "No MX records found for this domain. Please check the domain or its DNS settings.",
          },
        ];
      }
  
      return mxRecords.map((record, index) => ({
        id: index + 1,
        preference: record.pref,
        hostname: record.hostname,
        ip: record.ipaddress,
        ttl: `${record.ttl} seconds`,
      }));
    } catch (error) {
      console.error("Error fetching MX records:", error);
      return [{ error: "An error occurred while fetching MX records." }];
    }
  };
  
  // Function to fetch web server data (HTTP/HTTPS checks)
  export const fetchWebServerData = async (domain) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/webData?domain=${domain}`
      );
      console.log("API Response Data:", response.data);
  
      // If response is already an array
      const data = Array.isArray(response.data)
        ? response.data
        : [...(response.data.tests || []), ...(response.data.https_tests || [])];
  
      return data.map((item, index) => ({
        id: index + 1,
        category: item.category,
        host: item.host,
        level: item.level || "N/A",
        result: item.result,
      }));
    } catch (error) {
      console.error("Error fetching web server data:", error);
      return [];
    }
  };
  
  // Function to fetch DNS data
  export const fetchDNSData = async (domain) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/dnsData?domain=${domain}`
      );
  
      return response.data.map((item, index) => ({
        id: index + 1,
        category: item.category,
        host: item.host,
        result: item.result,
        level: item.level.toLowerCase(),
      }));
    } catch (error) {
      console.error("Error fetching DNS data:", error);
      return [];
    }
  };
  
  // Function to map level to more readable format
  const mapLevel = (level) => {
    const normalized = level.toLowerCase();
    if (normalized === "passed") return "Success";
    if (normalized === "warning") return "Warning";
    return "Info";
  };
  
  // Function to fetch domain health data
  export const getDomainHealthData = async (domain) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/health?domain=${domain}`
      );
      return res.data; // Make sure to return the correct response object
    } catch (error) {
      console.error("Error fetching domain health data:", error);
      throw error; // Rethrow the error to handle it in the component
    }
  };
  
  // Your new function to fetch activity log
  export const fetchActivityLog = async (domain) => {
    if (!domain) {
      console.error("Domain is required for fetching activity log");
      throw new Error("Domain is required");
    }
  
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/activityLog?domain=${domain}`
      );
      if (response.data && response.data.activity_log) {
        return response.data.activity_log.reverse(); // reverse if you want oldest to newest
      }
      return [];
    } catch (error) {
      console.error(`Failed to fetch activity log for domain ${domain}:`, error);
      throw error;
    }
  };