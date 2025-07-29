import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  getRating,
  calculateOverallRiskScore,
} from "../../services/domainScoreServices";

const API_BASE = "http://localhost:3001/api";

const RiskDashboard = () => {
  // Get last selected domain from localStorage
  const selectedDomain =
    localStorage.getItem("domainDetailSelectedDomain") || "";

  // State for domain score
  const [riskScore, setRiskScore] = useState(null);
  const [riskGrade, setRiskGrade] = useState(null);
  const [gradeColor, setGradeColor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [domainOwnership, setDomainOwnership] = useState(false);

  // Domain Ratings box states
  const [industryInfo, setIndustryInfo] = useState({
    industryRating: "B+",
    industryAverage: 7.4,
    percentileRank: "85%",
    industryType: "IT Tools & Technology",
  });
  const [metricsLeft, setMetricsLeft] = useState([
    { domain: "Software Patching", rating: "N/A", score: 0 },
    { domain: "Application Security", rating: "N/A", score: 0 },
    { domain: "Web Encryption", rating: "N/A", score: 0 },
    { domain: "Network Filtering", rating: "N/A", score: 0 },
    { domain: "Breach Events", rating: "N/A", score: 0 },
  ]);
  const [metricsRight, setMetricsRight] = useState([
    { domain: "System Reputation", rating: "N/A", score: 0 },
    { domain: "Email Security", rating: "N/A", score: 0 },
    { domain: "DNS Security", rating: "N/A", score: 0 },
    { domain: "System Hosting", rating: "N/A", score: 0 },
  ]);

  // Check domain ownership
  useEffect(() => {
    const checkDomainOwnership = async () => {
      if (!selectedDomain) {
        setDomainOwnership(false);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = localStorage.getItem("currentUser");
        const response = await fetch("http://localhost:3000/api/domains");
        const domains = await response.json();

        const userDomain = domains.find(
          (domain) =>
            domain.name === selectedDomain && domain.userEmail === currentUser
        );

        setDomainOwnership(!!userDomain);

        if (!userDomain) {
          setIsLoading(false);
          setHasError(true);
          setRiskScore(null);
          setRiskGrade(null);
          setGradeColor(null);
        }
      } catch (error) {
        console.error("Error checking domain ownership:", error);
        setDomainOwnership(false);
        setIsLoading(false);
        setHasError(true);
      }
    };

    checkDomainOwnership();
  }, [selectedDomain]);

  // Fetch domain score from API and calculate
  useEffect(() => {
    const fetchDomainScore = async () => {
      if (!selectedDomain || !domainOwnership) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(`${API_BASE}?url=${selectedDomain}`);
        if (!response.ok) throw new Error("Failed to fetch domain score");
        const apiData = await response.json();

        // Calculate overall risk score
        const score = calculateOverallRiskScore(apiData);
        setRiskScore(score);

        // Calculate individual domain scores using domainScoreServices
        const patchingScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculatePatchingScore(apiData.technologies));
        const appSecScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculateAppSecurityScore(selectedDomain));
        const webEncScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculateWebEncryptionScore(selectedDomain));
        const netFiltScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculateNetworkFilteringScore(selectedDomain));
        const breachEventsScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculateBreachEventsScore(selectedDomain));

        // Calculate right part domain scores
        const systemReputationScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculateSystemReputationScore(selectedDomain));
        const emailSecurityScore = 0; // Placeholder, add function if available
        const dnsSecurityScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculateDnsSecurityScore(selectedDomain));
        const systemHostingScore = await import(
          "../../services/domainScoreServices"
        ).then((m) => m.calculateSystemHostingScore(selectedDomain));

        setMetricsLeft([
          {
            domain: "Software Patching",
            rating: getRating(patchingScore),
            score: patchingScore,
          },
          {
            domain: "Application Security",
            rating: getRating(appSecScore),
            score: appSecScore,
          },
          {
            domain: "Web Encryption",
            rating: getRating(webEncScore),
            score: webEncScore,
          },
          {
            domain: "Network Filtering",
            rating: getRating(netFiltScore),
            score: netFiltScore,
          },
          {
            domain: "Breach Events",
            rating: getRating(breachEventsScore),
            score: breachEventsScore,
          },
        ]);

        setMetricsRight([
          {
            domain: "System Reputation",
            rating: getRating(systemReputationScore),
            score: systemReputationScore,
          },
          {
            domain: "Email Security",
            rating: "N/A",
            score: emailSecurityScore,
          },
          {
            domain: "DNS Security",
            rating: getRating(dnsSecurityScore),
            score: dnsSecurityScore,
          },
          {
            domain: "System Hosting",
            rating: getRating(systemHostingScore),
            score: systemHostingScore,
          },
        ]);

        // Grade logic
        let grade = "N/A";
        let color = "#6b7280";
        if (score >= 8) {
          grade = "A";
          color = "#10b981";
        } else if (score >= 6) {
          grade = "B";
          color = "#f59e0b";
        } else if (score >= 4) {
          grade = "C";
          color = "#f97316";
        } else if (score >= 2) {
          grade = "D";
          color = "#ef4444";
        } else if (score >= 0) {
          grade = "F";
          color = "#dc2626";
        }

        setRiskGrade(grade);
        setGradeColor(color);
      } catch (err) {
        setHasError(true);
        setRiskScore(null);
        setRiskGrade(null);
        setGradeColor(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomainScore();
  }, [selectedDomain, domainOwnership]);

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

  const getRatingColor = (rating) => {
    const colorMap = {
      A: "bg-emerald-100 text-emerald-800 border-emerald-200",
      B: "bg-amber-100 text-amber-800 border-amber-200",
      C: "bg-orange-100 text-orange-800 border-orange-200",
      D: "bg-red-100 text-red-800 border-red-200",
      F: "bg-red-200 text-red-900 border-red-300",
      "N/A": "bg-gray-100 text-gray-600 border-gray-200",
    };
    return colorMap[rating] || colorMap["N/A"];
  };

  const renderScoreDisplay = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#800080] border-t-[#d181d1]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#d181d1] animate-ping"></div>
          </div>
          <span className="text-gray-600 text-sm mt-4 font-medium">
            Analyzing security data...
          </span>
        </div>
      );
    }

    if (hasError || riskScore === null || !domainOwnership) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="bg-gray-50 rounded-full p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            No Data Available
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {!selectedDomain
              ? "Please select a domain to view security analysis"
              : !domainOwnership
              ? "This domain is not associated with your account"
              : "Unable to load domain security score"}
          </p>
        </div>
      );
    }

    return (
      <CircularProgressbar
        value={(riskScore / 10) * 100}
        text={riskGrade}
        styles={buildStyles({
          textColor: gradeColor,
          pathColor: gradeColor,
          trailColor: "#f3f4f6",
          textSize: "2.5rem",
          strokeLinecap: "round",
          pathTransitionDuration: 1,
        })}
      />
    );
  };

  return (
    <div className="w-full p-4 md:p-6 pt-6 md:pt-8 text-gray-900">
      <h2 className="text-gray-800 font-bold text-xl md:text-2xl mb-4">
        Security Analysis Results
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 mb-10">
        {/* Domain Score Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-800">
            Domain Score
          </h2>

          <div className="w-52 h-52 md:w-64 md:h-64 relative">
            {renderScoreDisplay()}
          </div>

          <div className="text-center mt-6">
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : riskScore !== null && domainOwnership
                ? `${riskScore.toFixed(1)} / 10`
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {selectedDomain && domainOwnership
                ? `Last updated: ${new Date().toLocaleDateString()}`
                : "Select your domain to view score"}
            </p>
          </div>
        </div>

        {/* Domain Ratings Box */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          {/* Industry Info Cards */}
          <div className="mb-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
              Industry Comparison
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="text-blue-600 text-xs font-semibold mb-1">
                  Industry Rating
                </div>
                <div className="text-blue-900 font-bold text-lg">
                  {industryInfo.industryRating}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="text-green-600 text-xs font-semibold mb-1">
                  Industry Average
                </div>
                <div className="text-green-900 font-bold text-lg">
                  {industryInfo.industryAverage}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="text-purple-600 text-xs font-semibold mb-1">
                  Percentile Rank
                </div>
                <div className="text-purple-900 font-bold text-lg">
                  {industryInfo.percentileRank}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="text-orange-600 text-xs font-semibold mb-1">
                  Industry Type
                </div>
                <div className="text-orange-900 font-bold text-sm leading-tight">
                  {industryInfo.industryType}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                Domain Ratings
              </h3>
              <div className="space-y-3">
                {metricsLeft.map((item, index) => (
                  <div
                    key={item.domain}
                    className="group flex justify-between items-center rounded-xl p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <span className="text-gray-800 font-semibold text-sm md:text-base">
                      {item.domain}
                    </span>
                    <div className="flex items-center gap-3">
                      {getStars(item.rating)}
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-bold border ${getRatingColor(
                          item.rating
                        )}`}
                      >
                        {item.rating}
                      </span>
                      <span className="text-gray-700 font-bold text-sm md:text-base">
                        {item.score.toFixed(1)}
                      </span>
                      <span className="text-blue-500 font-bold text-lg group-hover:translate-x-1 transition-transform duration-200">
                        →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
                Other Domains
              </h3>
              <div className="space-y-3">
                {metricsRight.map((item, index) => (
                  <div
                    key={item.domain}
                    className="group flex justify-between items-center rounded-xl p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <span className="text-gray-800 font-semibold text-sm md:text-base">
                      {item.domain}
                    </span>
                    <div className="flex items-center gap-3">
                      {getStars(item.rating)}
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-bold border ${getRatingColor(
                          item.rating
                        )}`}
                      >
                        {item.rating}
                      </span>
                      <span className="text-gray-700 font-bold text-sm md:text-base">
                        {item.score.toFixed(1)}
                      </span>
                      <span className="text-purple-500 font-bold text-lg group-hover:translate-x-1 transition-transform duration-200">
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
