import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  getRating,
  calculatePatchingScore,
  calculateAppSecurityScore,
  calculateWebEncryptionScore,
  calculateNetworkFilteringScore,
  calculateBreachEventsScore,
  calculateSystemReputationScore,
  calculateDnsSecurityScore,
  calculateSystemHostingScore
} from "../../services/domainScoreServices";
import BASE_URL from "../../services/api";
const RiskDashboard = ({ domain }) => {
  // Load data from localStorage or use defaults
  const [industryInfo, setIndustryInfo] = useState(() => {
    const saved = localStorage.getItem(`dashboardData_${domain}`);
    return saved ? JSON.parse(saved).industryInfo : {
      industryRating: "B+",
      industryAverage: 7.4,
      percentileRank: "85%",
      industryType: "IT Tools & Technology",
    };
  });

  const [metricsLeft, setMetricsLeft] = useState(() => {
    const saved = localStorage.getItem(`dashboardData_${domain}`);
    return saved ? JSON.parse(saved).metricsLeft : [
      { domain: "Software Patching", rating: "N/A", score: 0 },
      { domain: "Application Security", rating: "N/A", score: 0 },
      { domain: "Web Encryption", rating: "N/A", score: 0 },
      { domain: "Network Filtering", rating: "N/A", score: 0 },
      { domain: "Breach Events", rating: "N/A", score: 0 },
    ];
  });

  const [metricsRight, setMetricsRight] = useState(() => {
    const saved = localStorage.getItem(`dashboardData_${domain}`);
    return saved ? JSON.parse(saved).metricsRight : [
      { domain: "System Reputation", rating: "N/A", score: 0 },
      { domain: "Email Security", rating: "N/A", score: 0 },
      { domain: "DNS Security", rating: "N/A", score: 0 },
      { domain: "System Hosting", rating: "N/A", score: 0 },
    ];
  });

  const [riskScore, setRiskScore] = useState(() => {
    const saved = localStorage.getItem(`dashboardData_${domain}`);
    return saved ? JSON.parse(saved).riskScore : 0;
  });

  // Fetch tech stack data and update metrics
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!domain) {
          console.log("No domain provided");
          return;
        }

        console.log("Fetching data for domain:", domain);

        // Fetch tech stack data
        const techStackResponse = await fetch(`${BASE_URL}/tech-stack?url=${domain}`);

        if (!techStackResponse.ok) {
          const text = await techStackResponse.text();
          console.error("API error response:", text);
          throw new Error(`Failed to fetch tech stack data: ${techStackResponse.status} ${techStackResponse.statusText}`);
        }

        const techStackData = await techStackResponse.json();


        // Calculate all scores
        const patchingScore = calculatePatchingScore(techStackData.technologies);
        const appSecurityScore = await calculateAppSecurityScore(domain);
        const webEncryptionScore = await calculateWebEncryptionScore(domain);
        const networkFilteringScore = await calculateNetworkFilteringScore(domain);
        const breachEventsScore = await calculateBreachEventsScore(domain);
        const systemReputationScore = await calculateSystemReputationScore(domain);
        const dnsSecurityScore = await calculateDnsSecurityScore(domain);
        const systemHostingScore = await calculateSystemHostingScore(domain);

        // Get ratings for all scores
        const patchingRating = getRating(patchingScore);
        const appSecurityRating = getRating(appSecurityScore);
        const webEncryptionRating = getRating(webEncryptionScore);
        const networkFilteringRating = getRating(networkFilteringScore);
        const breachEventsRating = getRating(breachEventsScore);
        const systemReputationRating = getRating(systemReputationScore);
        const dnsSecurityRating = getRating(dnsSecurityScore);
        const systemHostingRating = getRating(systemHostingScore);

        // Update metricsLeft with new scores
        setMetricsLeft([
          { domain: "Software Patching", rating: patchingRating, score: patchingScore },
          { domain: "Application Security", rating: appSecurityRating, score: appSecurityScore },
          { domain: "Web Encryption", rating: webEncryptionRating, score: webEncryptionScore },
          { domain: "Network Filtering", rating: networkFilteringRating, score: networkFilteringScore },
          { domain: "Breach Events", rating: breachEventsRating, score: breachEventsScore },
        ]);

        // Update metricsRight with new scores
        setMetricsRight([
          { domain: "System Reputation", rating: systemReputationRating, score: systemReputationScore },
          { domain: "Email Security", rating: "A", score: 10 }, // This will be updated when email security endpoint is implemented
          { domain: "DNS Security", rating: dnsSecurityRating, score: dnsSecurityScore },
          { domain: "System Hosting", rating: systemHostingRating, score: systemHostingScore },
        ]);

        // Calculate overall risk score
        const allScores = [
          patchingScore,
          appSecurityScore,
          webEncryptionScore,
          networkFilteringScore,
          breachEventsScore,
          systemReputationScore,
          dnsSecurityScore,
          systemHostingScore
        ].filter(score => score > 0); // Only include valid scores

        const averageScore = allScores.length > 0
          ? allScores.reduce((a, b) => a + b, 0) / allScores.length
          : 0;

        setRiskScore(parseFloat(averageScore.toFixed(1)));

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [domain]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (domain) {
      const domainData = {
        industryInfo,
        metricsLeft,
        metricsRight,
        riskScore
      };
      localStorage.setItem(`dashboardData_${domain}`, JSON.stringify(domainData));
    }
  }, [domain, industryInfo, metricsLeft, metricsRight, riskScore]);

  // Load data from localStorage when domain changes
  useEffect(() => {
    if (domain) {
      const savedData = localStorage.getItem(`dashboardData_${domain}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setIndustryInfo(data.industryInfo);
        setMetricsLeft(data.metricsLeft);
        setMetricsRight(data.metricsRight);
        setRiskScore(data.riskScore);
      }
    }
  }, [domain]);

  const getStars = (rating) => {
    const ratingMap = { A: 5, B: 4, C: 3, D: 2, F: 1 };
    const starsCount = ratingMap[rating] || 0;
    const totalStars = 5;

    return (
      <div className="flex space-x-0.5">
        {[...Array(totalStars)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-sm md:text-base">
            {i < starsCount ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  // RiskRecon score out of 10, convert to percent for progress bar (0-100)
  const riskScorePercent = (riskScore / 10) * 100;
  const getCoreGrade = (score) => {
    if (score >= 7.5) return "A";
    if (score >= 6.0) return "B";
    if (score >= 4.5) return "C";
    if (score >= 3.0) return "D";
    return "F";
  };
  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "#22c55e"; // green
      case "B":
        return "#eab308"; // yellow
      case "C":
        return "#f97316"; // orange
      case "D":
        return "#ef4444"; // red
      case "F":
        return "#991b1b"; // dark red
      default:
        return "#6b7280"; // gray
    }
  };
  const riskGrade = getCoreGrade(riskScore);
  const gradeColor = getGradeColor(riskGrade);

  const showMetrics = !!domain;

  return (
    <div className="w-full bg-white p-3 md:p-4 pt-4 md:pt-6 text-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Risk Score Panel */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col items-center justify-center p-3 md:p-4">
          <h2 className="text-sm md:text-base font-semibold mb-2 md:mb-3">Domain Score</h2>
          <div className="w-48 h-48 md:w-60 md:h-60">
            <CircularProgressbar
              value={riskScorePercent}
              text={riskGrade}
              styles={buildStyles({
                textColor: gradeColor,
                pathColor: gradeColor,
                trailColor: "#d1d5db",
                textSize: "2.5rem",
                strokeLinecap: "round",
              })}
            />

          </div>
          <p className="text-lg md:text-xl font-medium mt-3 md:mt-5">{riskScore} / 10</p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Powered by Mastercard
          </p>
        </div>

        {/* Combined Domain Ratings Box */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 md:p-6">
          {/* Industry Info Section */}
          <div className="mb-4 md:mb-6 grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm text-gray-700 font-medium">
            <div className="border border-gray-300 rounded px-2 md:px-3 py-2 text-center bg-gray-50">
              <div className="text-gray-500 text-xs mb-1">Industry Rating</div>
              <div className="text-gray-900 font-semibold">
                {showMetrics ? industryInfo.industryRating : "N/A"}
              </div>
            </div>
            <div className="border border-gray-300 rounded px-2 md:px-3 py-2 text-center bg-gray-50">
              <div className="text-gray-500 text-xs mb-1">Industry Average</div>
              <div className="text-gray-900 font-semibold">
                {showMetrics ? industryInfo.industryAverage : "N/A"}
              </div>
            </div>
            <div className="border border-gray-300 rounded px-2 md:px-3 py-2 text-center bg-gray-50">
              <div className="text-gray-500 text-xs mb-1">Percentile Rank</div>
              <div className="text-gray-900 font-semibold">
                {showMetrics ? industryInfo.percentileRank : "N/A"}
              </div>
            </div>
            <div className="border border-gray-300 rounded px-2 md:px-3 py-2 text-center bg-gray-50">
              <div className="text-gray-500 text-xs mb-1">Industry Type</div>
              <div className="text-gray-900 font-semibold text-xs">
                {showMetrics ? industryInfo.industryType : "N/A"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left Column */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 border-b border-gray-200 pb-1">
                Domain Ratings
              </h3>
              <div className="space-y-2 md:space-y-3">
                {metricsLeft.map((item) => (
                  <div
                    key={item.domain}
                    className="flex justify-between items-center rounded-lg p-2 md:p-3 shadow-sm bg-gray-50 hover:bg-green-50 transition-colors duration-300 cursor-pointer"
                  >
                    <span className="text-gray-800 font-medium text-xs md:text-sm">
                      {item.domain}
                    </span>
                    <div className="flex items-center gap-1 md:gap-2">
                      {getStars(item.rating)}
                      <span
                        className={`px-1.5 md:px-2 py-0.5 text-xs rounded-full font-semibold ${item.rating === "A"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                          }`}
                      >
                        {item.rating}
                      </span>
                      <span className="text-gray-600 font-semibold text-xs md:text-sm">
                        {(typeof item.score === "number" && !isNaN(item.score) ? item.score : 0).toFixed(1)}
                      </span>

                      <span className="text-green-400 font-bold text-sm md:text-lg">
                        →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 border-b border-gray-200 pb-1">
                Other Domains
              </h3>
              <div className="space-y-2 md:space-y-3">
                {metricsRight.map((item) => (
                  <div
                    key={item.domain}
                    className="flex justify-between items-center rounded-lg p-2 md:p-3 shadow-sm bg-gray-50 hover:bg-green-50 transition-colors duration-300 cursor-pointer"
                  >
                    <span className="text-gray-800 font-medium text-xs md:text-sm">
                      {item.domain}
                    </span>
                    <div className="flex items-center gap-1 md:gap-2">
                      {getStars(item.rating)}
                      <span className="px-1.5 md:px-2 py-0.5 text-xs rounded-full font-semibold bg-green-200 text-green-800">
                        {item.rating}
                      </span>
                      <span className="text-gray-600 font-semibold text-xs md:text-sm">
                        {(typeof item.score === "number" && !isNaN(item.score) ? item.score : 0).toFixed(1)}
                      </span>

                      <span className="text-green-400 font-bold text-sm md:text-lg">
                        →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDashboard;
