import axios from "axios";
import BASE_URL from "./api";
// const BASE_URL = "http://localhost:3001/api";
// Helper function to get rating based on score
export const getRating = (score) => {
  if (score >= 8) return "A";
  if (score >= 6) return "B";
  if (score >= 4) return "C";
  if (score >= 2) return "D";
  return "F";
};

// Software Patching Score
export const calculatePatchingScore = (technologies) => {
  if (!technologies || technologies.length === 0) return 0;

  let achievedPoints = 0;
  let maximumPoints = 0;

  technologies.forEach((tech) => {
    if (tech && tech.version) {
      // Base points for having a version
      achievedPoints += 2;
      maximumPoints += 2;

      // Bonus points for version quality
      if (tech.version.toLowerCase().includes("latest")) {
        achievedPoints += 2;
      } else if (
        tech.version.toLowerCase().includes("stable") ||
        tech.version.toLowerCase().includes("lts")
      ) {
        achievedPoints += 1;
      }
      maximumPoints += 2; // Max possible bonus points
    } else if (tech) {
      // Minimal points for having the technology without version
      achievedPoints += 1;
      maximumPoints += 2; // Max possible points for tech without version
    }
  });

  // Calculate score out of 10
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;

  return parseFloat(score.toFixed(1));
};

// Application Security Score
export const calculateAppSecurityScore = async (domain) => {
  try {
    const endpoints = ["/http-security", "/headers", "/hsts"];
    let totalScore = 0;
    let validEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${BASE_URL}${endpoint}?url=${domain}`
        );
        const data = response.data;

        let endpointScore = 0;
        switch (endpoint) {
          case "/http-security":
            endpointScore = calculateHttpSecurityScore(data);
            break;
          case "/headers":
            endpointScore = calculateHeadersScore(data);
            break;
          case "/hsts":
            endpointScore = calculateHstsScore(data);
            break;
        }

        if (endpointScore > 0) {
          totalScore += endpointScore;
          validEndpoints++;
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }

    return validEndpoints > 0
      ? parseFloat((totalScore / validEndpoints).toFixed(1))
      : 0;
  } catch (error) {
    console.error("Error calculating application security score:", error);
    return 0;
  }
};

// Web Encryption Score
export const calculateWebEncryptionScore = async (domain) => {
  try {
    const endpoints = ["/ssl", "/tls"];
    let totalScore = 0;
    let validEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${BASE_URL}${endpoint}?url=${domain}`
        );
        const data = response.data;

        let endpointScore = 0;
        switch (endpoint) {
          case "/ssl":
            endpointScore = calculateSslScore(data);
            break;
          case "/tls":
            endpointScore = calculateTlsScore(data);
            break;
        }

        if (endpointScore > 0) {
          totalScore += endpointScore;
          validEndpoints++;
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }

    return validEndpoints > 0
      ? parseFloat((totalScore / validEndpoints).toFixed(1))
      : 0;
  } catch (error) {
    console.error("Error calculating web encryption score:", error);
    return 0;
  }
};

// Network Filtering Score
export const calculateNetworkFilteringScore = async (domain) => {
  try {
    const endpoints = ["/ports", "/firewall"];
    let totalScore = 0;
    let validEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${BASE_URL}${endpoint}?url=${domain}`
        );
        const data = response.data;

        let endpointScore = 0;
        switch (endpoint) {
          case "/ports":
            endpointScore = calculatePortsScore(data);
            break;
          case "/firewall":
            endpointScore = calculateFirewallScore(data);
            break;
        }

        if (endpointScore > 0) {
          totalScore += endpointScore;
          validEndpoints++;
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }

    return validEndpoints > 0
      ? parseFloat((totalScore / validEndpoints).toFixed(1))
      : 0;
  } catch (error) {
    console.error("Error calculating network filtering score:", error);
    return 0;
  }
};

// Breach Events Score
export const calculateBreachEventsScore = async (domain) => {
  try {
    const endpoints = ["/threats", "/block-lists"];
    let totalScore = 0;
    let validEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${BASE_URL}${endpoint}?url=${domain}`
        );
        const data = response.data;

        let endpointScore = 0;
        switch (endpoint) {
          case "/threats":
            endpointScore = calculateThreatsScore(data);
            break;
          case "/block-lists":
            endpointScore = calculateBlockListsScore(data);
            break;
        }

        if (endpointScore > 0) {
          totalScore += endpointScore;
          validEndpoints++;
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }

    return validEndpoints > 0
      ? parseFloat((totalScore / validEndpoints).toFixed(1))
      : 0;
  } catch (error) {
    console.error("Error calculating breach events score:", error);
    return 0;
  }
};

// System Reputation Score
export const calculateSystemReputationScore = async (domain) => {
  try {
    const endpoints = ["/threats", "/block-lists"];
    let totalScore = 0;
    let validEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${BASE_URL}${endpoint}?url=${domain}`
        );
        const data = response.data;

        let endpointScore = 0;
        switch (endpoint) {
          case "/threats":
            endpointScore = calculateThreatsReputationScore(data);
            break;
          case "/block-lists":
            endpointScore = calculateBlockListsReputationScore(data);
            break;
        }

        if (endpointScore > 0) {
          totalScore += endpointScore;
          validEndpoints++;
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }

    return validEndpoints > 0
      ? parseFloat((totalScore / validEndpoints).toFixed(1))
      : 0;
  } catch (error) {
    console.error("Error calculating system reputation score:", error);
    return 0;
  }
};

// DNS Security Score
export const calculateDnsSecurityScore = async (domain) => {
  try {
    const endpoints = ["/dnssec", "/dns"];
    let totalScore = 0;
    let validEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${BASE_URL}${endpoint}?url=${domain}`
        );
        const data = response.data;

        let endpointScore = 0;
        switch (endpoint) {
          case "/dnssec":
            endpointScore = calculateDnssecScore(data);
            break;
          case "/dns":
            endpointScore = calculateDnsScore(data);
            break;
        }

        if (endpointScore > 0) {
          totalScore += endpointScore;
          validEndpoints++;
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }

    return validEndpoints > 0
      ? parseFloat((totalScore / validEndpoints).toFixed(1))
      : 0;
  } catch (error) {
    console.error("Error calculating DNS security score:", error);
    return 0;
  }
};

// System Hosting Score
export const calculateSystemHostingScore = async (domain) => {
  try {
    const endpoints = ["/get-ip", "/whois"];
    let totalScore = 0;
    let validEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${BASE_URL}${endpoint}?url=${domain}`
        );
        const data = response.data;

        let endpointScore = 0;
        switch (endpoint) {
          case "/get-ip":
            endpointScore = calculateIpScore(data);
            break;
          case "/whois":
            endpointScore = calculateWhoisScore(data);
            break;
        }

        if (endpointScore > 0) {
          totalScore += endpointScore;
          validEndpoints++;
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }

    return validEndpoints > 0
      ? parseFloat((totalScore / validEndpoints).toFixed(1))
      : 0;
  } catch (error) {
    console.error("Error calculating system hosting score:", error);
    return 0;
  }
};

// Helper scoring functions
const calculateHttpSecurityScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // HTTPS is critical - give it more weight
  maximumPoints += 2;
  if (data.httpsEnabled) achievedPoints += 2;

  // Other security headers
  const securityHeaders = [
    { key: "secureCookies", weight: 1 },
    { key: "xssProtection", weight: 1 },
    { key: "contentSecurityPolicy", weight: 1.5 },
    { key: "frameOptions", weight: 1 },
  ];

  securityHeaders.forEach((header) => {
    maximumPoints += header.weight;
    if (data[header.key]) achievedPoints += header.weight;
  });

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateHeadersScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Critical headers get more weight
  const headers = [
    { key: "strictTransportSecurity", weight: 2 },
    { key: "contentSecurityPolicy", weight: 2 },
    { key: "xContentTypeOptions", weight: 1 },
    { key: "xFrameOptions", weight: 1 },
    { key: "referrerPolicy", weight: 1 },
    { key: "permissionsPolicy", weight: 1 },
    { key: "xXssProtection", weight: 1 },
    { key: "expectCt", weight: 1 },
  ];

  headers.forEach((header) => {
    maximumPoints += header.weight;
    if (data[header.key]) achievedPoints += header.weight;
  });

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateHstsScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // HSTS enabled is critical
  maximumPoints += 3;
  if (data.hstsEnabled) {
    achievedPoints += 3;

    // Additional HSTS features
    if (data.maxAge >= 31536000) achievedPoints += 2; // 1 year or more
    else if (data.maxAge >= 2592000) achievedPoints += 1; // 30 days or more
    maximumPoints += 2;

    if (data.includeSubDomains) achievedPoints += 2;
    maximumPoints += 2;

    if (data.preload) achievedPoints += 1;
    maximumPoints += 1;
  }

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

export const calculateSslScore = (data) => {
  if (!data || typeof data !== "object") return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Critical SSL features
  if (data.valid) {
    achievedPoints += 3;
    maximumPoints += 3;

    if (data.issuer) achievedPoints += 1;
    maximumPoints += 1;

    if (data.expiryDate) {
      const daysUntilExpiry = Math.floor(
        (new Date(data.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry > 90) achievedPoints += 2;
      else if (daysUntilExpiry > 30) achievedPoints += 1;
      maximumPoints += 2;
    }

    if (data.strongCipher) achievedPoints += 2;
    maximumPoints += 2;

    if (data.secureProtocol) achievedPoints += 1;
    maximumPoints += 1;

    if (data.trustedIssuer) achievedPoints += 1;
    maximumPoints += 1;
  }

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateTlsScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // TLS version scoring
  if (data.tlsVersion >= 1.3) {
    achievedPoints += 3;
  } else if (data.tlsVersion >= 1.2) {
    achievedPoints += 2;
  }
  maximumPoints += 3;

  // Other TLS features
  if (data.strongCipherSuites) achievedPoints += 2;
  maximumPoints += 2;

  if (data.forwardSecrecy) achievedPoints += 2;
  maximumPoints += 2;

  if (data.certificateValid) achievedPoints += 2;
  maximumPoints += 2;

  if (data.secureRenegotiation) achievedPoints += 1;
  maximumPoints += 1;

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculatePortsScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Secure Ports
  const keySecurePorts = [443, 22];
  maximumPoints += keySecurePorts.length * 1.5;
  if (data.securePorts) {
    keySecurePorts.forEach((port) => {
      if (data.securePorts.includes(port)) {
        achievedPoints += 1.5;
      }
    });
  }

  // Closed Dangerous Ports
  const dangerousPorts = [21, 23, 3389, 445, 1433, 3306, 5432];
  maximumPoints += dangerousPorts.length;
  if (data.closedPorts) {
    dangerousPorts.forEach((port) => {
      if (data.closedPorts.includes(port)) {
        achievedPoints += 1;
      }
    });
  }

  // Filtered Ports
  if (data.filteredPorts) {
    const filteredCount = data.filteredPorts.length;
    maximumPoints += 2;
    if (filteredCount >= 20) achievedPoints += 2;
    else if (filteredCount >= 10) achievedPoints += 1;
  }

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return Math.min(parseFloat(score.toFixed(1)), 10);
};

const calculateFirewallScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Critical firewall features
  if (data.firewallEnabled) {
    achievedPoints += 3;
    maximumPoints += 3;

    if (data.ruleCount > 10) achievedPoints += 2;
    else if (data.ruleCount > 0) achievedPoints += 1;
    maximumPoints += 2;

    if (data.denyAllDefault) achievedPoints += 2;
    maximumPoints += 2;

    if (data.secureRules) achievedPoints += 1;
    maximumPoints += 1;

    if (data.loggingEnabled) achievedPoints += 1;
    maximumPoints += 1;

    if (data.rateLimiting) achievedPoints += 1;
    maximumPoints += 1;

    if (data.ddosProtection) achievedPoints += 1;
    maximumPoints += 1;
  }

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateThreatsScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Assuming the absence of threats is the ideal state (max points)
  // Each type of threat/event reduces the score from the maximum.
  // To use achieved/maximum points, we can frame it as achieving points for *not having* threats/events.

  // Maximum possible points for each threat type (arbitrary, can be adjusted)
  const maxPointsPerThreatType = 2;

  maximumPoints += maxPointsPerThreatType; // activeThreats
  if (!data.activeThreats || data.activeThreats.length === 0)
    achievedPoints += maxPointsPerThreatType;

  maximumPoints += maxPointsPerThreatType; // recentBreaches
  if (!data.recentBreaches || data.recentBreaches.length === 0)
    achievedPoints += maxPointsPerThreatType;

  maximumPoints += maxPointsPerThreatType; // malwareDetected
  if (!data.malwareDetected) achievedPoints += maxPointsPerThreatType;

  maximumPoints += maxPointsPerThreatType; // phishingAttempts
  if (!data.phishingAttempts || data.phishingAttempts.length === 0)
    achievedPoints += maxPointsPerThreatType;

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateBlockListsScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Assuming the absence of listings is the ideal state (max points)
  // Each type of block list reduces the score from the maximum.
  // Frame as achieving points for *not being* on block lists.

  // Maximum possible points for each block list type (arbitrary, can be adjusted)
  const maxPointsPerBlockListType = 2;

  maximumPoints += maxPointsPerBlockListType; // spamhaus
  if (!data.spamhaus || data.spamhaus.length === 0)
    achievedPoints += maxPointsPerBlockListType;

  maximumPoints += maxPointsPerBlockListType; // surbl
  if (!data.surbl || data.surbl.length === 0)
    achievedPoints += maxPointsPerBlockListType;

  maximumPoints += maxPointsPerBlockListType; // uribl
  if (!data.uribl || data.uribl.length === 0)
    achievedPoints += maxPointsPerBlockListType;

  maximumPoints += maxPointsPerBlockListType; // dnsbl
  if (!data.dnsbl || data.dnsbl.length === 0)
    achievedPoints += maxPointsPerBlockListType;

  maximumPoints += maxPointsPerBlockListType; // sorbs
  if (!data.sorbs || data.sorbs.length === 0)
    achievedPoints += maxPointsPerBlockListType;

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateThreatsReputationScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  if (data.reputationScore !== undefined) {
    const normalizedScore = data.reputationScore / 10;
    return parseFloat(normalizedScore.toFixed(1));
  }

  const pointsPerAbsence = 1.5; // Points for each type of threat absence

  maximumPoints += pointsPerAbsence; // activeThreats
  if (!data.activeThreats || data.activeThreats.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // recentBreaches
  if (!data.recentBreaches || data.recentBreaches.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // malwareDetected
  if (!data.malwareDetected) achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // phishingAttempts
  if (!data.phishingAttempts || data.phishingAttempts.length === 0)
    achievedPoints += pointsPerAbsence;

  const pointsPerAbsenceSuspicious = 1; // Slightly less weight for suspicious activity
  maximumPoints += pointsPerAbsenceSuspicious; // suspiciousActivity
  if (!data.suspiciousActivity || data.suspiciousActivity.length === 0)
    achievedPoints += pointsPerAbsenceSuspicious;

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateBlockListsReputationScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Frame as achieving points for *not being* on block lists.

  const pointsPerAbsence = 1.5; // Points for each block list type absence

  maximumPoints += pointsPerAbsence; // spamhaus
  if (!data.spamhaus || data.spamhaus.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // surbl
  if (!data.surbl || data.surbl.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // uribl
  if (!data.uribl || data.uribl.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // dnsbl
  if (!data.dnsbl || data.dnsbl.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // sorbs
  if (!data.sorbs || data.sorbs.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // abuseipdb
  if (!data.abuseipdb || data.abuseipdb.length === 0)
    achievedPoints += pointsPerAbsence;

  maximumPoints += pointsPerAbsence; // virustotal
  if (!data.virustotal || data.virustotal.length === 0)
    achievedPoints += pointsPerAbsence;

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateDnssecScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  maximumPoints += 1; // dnssecEnabled
  if (data.dnssecEnabled) {
    achievedPoints += 1;

    maximumPoints += 1; // validSignatures
    if (data.validSignatures) achievedPoints += 1;

    maximumPoints += 1; // algorithmSupported
    if (data.algorithmSupported) achievedPoints += 1;

    maximumPoints += 1; // keyRolloverEnabled
    if (data.keyRolloverEnabled) achievedPoints += 1;

    maximumPoints += 1; // nsecEnabled
    if (data.nsecEnabled) achievedPoints += 1;

    maximumPoints += 1; // dsRecordPresent
    if (data.dsRecordPresent) achievedPoints += 1;

    maximumPoints += 1; // trustAnchorConfigured
    if (data.trustAnchorConfigured) achievedPoints += 1;
  } else {
    // If DNSSEC is not enabled, these points are not achievable.
    // We could add them to max points to penalize lack of DNSSEC, or not.
    // Let's add them to maximumPoints to reflect the potential for improvement.
    maximumPoints += 6; // for validSignatures, algorithmSupported, etc.
  }

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateDnsScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  // Points for having key DNS records
  const keyRecords = ["A", "AAAA", "MX", "TXT", "SPF", "DKIM", "DMARC"];
  maximumPoints += keyRecords.length;
  if (data.records) {
    keyRecords.forEach((recordType) => {
      if (data.records[recordType]) {
        achievedPoints += 1;
      }
    });
  }

  // Points for various DNS security mechanisms
  maximumPoints += 1; // spfEnabled
  if (data.spfEnabled) achievedPoints += 1;

  maximumPoints += 1; // dkimEnabled
  if (data.dkimEnabled) achievedPoints += 1;

  maximumPoints += 1; // dmarcEnabled
  if (data.dmarcEnabled) achievedPoints += 1;

  maximumPoints += 1; // caaEnabled
  if (data.caaEnabled) achievedPoints += 1;

  maximumPoints += 1; // dnssecEnabled (redundant if using calculateDnssecScore, but good for a comprehensive DNS score)
  if (data.dnssecEnabled) achievedPoints += 1;

  maximumPoints += 1; // ttlConfigured (assuming a boolean or check for reasonable TTLs)
  if (data.ttlConfigured) achievedPoints += 1;

  maximumPoints += 1; // multipleNameservers
  if (data.multipleNameservers) achievedPoints += 1;

  maximumPoints += 1; // geoDistribution
  if (data.geoDistribution) achievedPoints += 1;

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateIpScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  maximumPoints += 1; // ip present
  if (data.ip) {
    achievedPoints += 1;

    maximumPoints += 1; // ipv6
    if (data.ipv6) achievedPoints += 1;

    maximumPoints += 1; // cdn
    if (data.cdn) achievedPoints += 1;

    maximumPoints += 1; // cloudProvider
    if (data.cloudProvider) achievedPoints += 1;

    maximumPoints += 1; // loadBalanced
    if (data.loadBalanced) achievedPoints += 1;

    maximumPoints += 1; // ddosProtection
    if (data.ddosProtection) achievedPoints += 1;
  } else {
    // If no IP data, these points are not applicable.
    // We can choose to add to maxPoints to penalize lack of IP info or not.
    // Let's add them to reflect potential.
    maximumPoints += 5; // for ipv6, cdn, cloudProvider, loadBalanced, ddosProtection
  }

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

const calculateWhoisScore = (data) => {
  if (!data) return 0;
  let achievedPoints = 0;
  let maximumPoints = 0;

  maximumPoints += 1; // registrant info present
  if (data.registrant) {
    achievedPoints += 1;

    maximumPoints += 1; // privacyProtected
    if (data.privacyProtected) achievedPoints += 1;

    maximumPoints += 1; // domainAge > 5 years
    if (data.domainAge && data.domainAge / 365 > 5) achievedPoints += 1;
    else if (data.domainAge && data.domainAge / 365 > 1) achievedPoints += 0.5; // Partial points for > 1 year

    maximumPoints += 1; // registrationPeriod > 5 years
    if (data.registrationPeriod && data.registrationPeriod > 5)
      achievedPoints += 1;
    else if (data.registrationPeriod && data.registrationPeriod > 1)
      achievedPoints += 0.5; // Partial points for > 1 year

    maximumPoints += 1; // registrarReputation === 'high'
    if (data.registrarReputation === "high") achievedPoints += 1;
  } else {
    // If no registrant data, these points are not applicable.
    maximumPoints += 4; // for privacy, age, period, reputation
  }

  // Normalize to a 0-10 score
  const score = maximumPoints > 0 ? (achievedPoints / maximumPoints) * 10 : 0;
  return parseFloat(score.toFixed(1));
};

// Dynamically score the entire API response
export const calculateOverallRiskScore = (data) => {
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

export const isValidDate = (d) => !isNaN(Date.parse(d));

// Example scoring function for tech stack risk based on PHP version
export function calculateTechRiskScore(data) {
  const php = data.technologies.find((t) => t.slug === "php");

  // No PHP detected or no version info – highest risk
  if (!php || !php.version) return 50;

  const versionParts = php.version.split(".");
  const major = parseInt(versionParts[0], 10);
  const minor = parseInt(versionParts[1] || "0", 10);

  if (isNaN(major)) return 50;

  // Risk scoring based on major (and minor) PHP version
  if (major >= 8) {
    if (minor >= 1) return 5;  // PHP 8.1+ — very low risk
    return 10;                 // PHP 8.0 — low risk
  } else if (major === 7) {
    if (minor >= 4) return 30; // PHP 7.4 — medium risk (still used but near EOL)
    return 40;                 // PHP 7.0–7.3 — high risk
  } else {
    return 50;                 // PHP 5.x or older — very high risk
  }
}

// Example scoring function for SSL
export function calculateSSLRiskScore(data) {
  let score = 0;

  if (data.issuer && data.issuer.O && data.issuer.O.includes("Let's Encrypt")) {
    score += 5;
  }

  if (data.bits && data.bits >= 2048) {
    score += 5;
  }

  return score;
}
