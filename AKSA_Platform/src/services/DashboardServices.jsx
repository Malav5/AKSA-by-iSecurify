import axios from "axios";
import BASE_URL from "./api"

export const fetchWhoisData = async (domain) => {
  try {
    const res = await axios.get(`${BASE_URL}/whois`, {
      params: { url: domain },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    return res.data.internicData; // this is the field with actual data
  } catch (err) {
    console.error("Error fetching WHOIS data:", err.message);
    return null;
  }
};


export const fetchSSLDetails = async (domain) => {
  try {
    const res = await axios.get(`${BASE_URL}/ssl`, {
      params: { url: domain },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    return res.data;
  } catch (err) {
    throw new Error("Failed to fetch SSL data: " + err.message);
  }
};

export const fetchDNSDetails = async (domain) => {
  try {
    const res = await axios.get(`${BASE_URL}/dns`, {
      params: { url: domain },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    return res.data;
  } catch (err) {
    throw new Error("Failed to fetch DNS data: " + err.message);
  }
};

export const fetchHttpHeaders = async (domain) => {
  const res = await axios.get(`${BASE_URL}/headers`, {
    params: { url: domain },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.data;
};

export const fetchHttpSecurity = async (domain) => {
  const res = await axios.get(`${BASE_URL}/http-security`, {
    params: { url: domain },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.data;
};

export const fetchTlsInfo = async (domain) => {
  const res = await axios.get(`${BASE_URL}/tls`, {
    params: { url: domain },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.data;
};


export const fetchLinkedPages = async (domain) => {
  try {
    const res = await axios.get(`${BASE_URL}/linked-pages`, {
      params: { url: domain },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.warn('No linked pages found for domain:', domain);
      return { internal: [], external: [] }; // Return empty data for 400 responses
    } else {
      console.error("Error fetching linked pages:", error);
      throw error; // Rethrow other errors
    }
  }
};

export const fetchCarbonData = async (domain) => {
  const res = await axios.get(`${BASE_URL}/carbon`, {
    params: { url: domain },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.data;
};

export const fetchSocialTags = async (domain) => {
  const res = await axios.get(`${BASE_URL}/social-tags`, {
    params: { url: domain },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.data;
};


// dashboardservices.jsx

// Fixed fetchRiskData function
export const fetchRiskData = async (domain) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: { url: domain },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = response.data;
    const score = calculateOverallRiskScore(data);

    return {
      success: true,
      data,
      riskScore: score,
    };
  } catch (error) {
    console.error("Error fetching risk data:", error);
    return { 
      success: false, 
      error: error.message || error 
    };
  }
};

// Dynamically score the entire API response
const calculateOverallRiskScore = (data) => {
  let totalPoints = 0;
  let maxPoints = 0;

  for (const [sectionKey, sectionValue] of Object.entries(data)) {
    if (typeof sectionValue !== "object" || sectionValue === null) continue;

    for (const [fieldKey, fieldValue] of Object.entries(sectionValue)) {
      maxPoints += 1;

      // Positive signals
      if (typeof fieldValue === "boolean") {
        totalPoints += fieldValue ? 1 : 0;
      } else if (typeof fieldValue === "string") {
        if (fieldKey.includes("valid") && isValidDate(fieldValue)) {
          totalPoints += new Date(fieldValue) > new Date() ? 1 : 0;
        } else if (fieldValue.length > 0) {
          totalPoints += 1;
        }
      } else if (Array.isArray(fieldValue)) {
        if (fieldKey.includes("blocklists")) {
          const clean = fieldValue.every((b) => b.isBlocked === false);
          totalPoints += clean ? 1 : 0;
        } else {
          totalPoints += fieldValue.length > 0 ? 1 : 0;
        }
      } else if (typeof fieldValue === "object" && fieldValue !== null) {
        const allTruthy = Object.values(fieldValue).some((v) => !!v);
        totalPoints += allTruthy ? 1 : 0;
      }
    }
  }

  // Avoid division by zero
  const finalScore = maxPoints === 0 ? 0 : (totalPoints / maxPoints) * 10;
  return parseFloat(finalScore.toFixed(1));
};

const isValidDate = (d) => !isNaN(Date.parse(d));;

// Fixed fetchTechStack function
export const fetchTechStack = async (domain) => {
  try {
    const response = await axios.get(`${BASE_URL}/tech-stack`, {
      params: { url: domain },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = response.data;
    const riskScore = calculateTechRiskScore(data);

    return {
      success: true,
      data,
      riskScore,
    };
  } catch (error) {
    console.error("Error fetching tech stack:", error);
    return { 
      success: false, 
      error: error.message || error 
    };
  }
};


// Example scoring function for tech stack
function calculateTechRiskScore(data) {
  // Basic example logic: give points based on PHP version
  const php = data.technologies.find((t) => t.slug === "php");
  if (!php || !php.version) return 0;

  const major = parseInt(php.version.split(".")[0], 10);
  if (major >= 8) return 10; // Low risk
  if (major >= 7) return 30; // Medium risk
  return 50; // High risk
}

export const fetchSSL = async (domain) => {
  try {
    const response = await axios.get(`${BASE_URL}/ssl-check`, {
      params: { url: domain },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = response.data;
    const riskScore = calculateSSLRiskScore(data);

    return {
      success: true,
      data,
      riskScore,
    };
  } catch (error) {
    console.error("Error fetching SSL data:", error);
    return { 
      success: false, 
      error: error.message || error 
    };
  }
};


// Example scoring function for SSL
function calculateSSLRiskScore(data) {
  let score = 0;

  if (data.issuer && data.issuer.O && data.issuer.O.includes("Let's Encrypt")) {
    score += 5;
  }

  if (data.bits && data.bits >= 2048) {
    score += 5;
  }

  return score;
}
