import axios from "axios";
import BASE_URL from "./api"
import { calculateOverallRiskScore, calculateTechRiskScore, calculateSSLRiskScore } from "./domainScoreServices";

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
