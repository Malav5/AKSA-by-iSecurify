import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const BlankRiskDashboard = () => {
  // Example industry info data
  const industryInfo = {
    industryRating: "-",
    industryAverage: "-",
    percentileRank: "-",
    industryType: "-",
  };

  const metricsLeft = [
    { domain: "Software Patching", rating: "-", score: 0 },
    { domain: "Application Security", rating: "-", score: 0 },
    { domain: "Web Encryption", rating: "-", score: 0 },
    { domain: "Network Filtering", rating: "-", score: 0 },
    { domain: "Breach Events", rating: "-", score: 0 },
  ];

  const metricsRight = [
    { domain: "System Reputation", rating: "-", score: 0 },
    { domain: "Email Security", rating: "-", score: 0 },
    { domain: "DNS Security", rating: "-", score: 0 },
    { domain: "System Hosting", rating: "-", score: 0 },
  ];

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
  const riskScore = 0;
  const riskScorePercent = (riskScore / 10) * 100;

  return (
    <div className="w-full bg-white p-3 md:p-4 pt-4 md:pt-6 text-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Risk Score Panel */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col items-center justify-center p-3 md:p-4">
          <h2 className="text-sm md:text-base font-semibold mb-2 md:mb-3">
            RiskRecon Score
          </h2>
          <div className="w-48 h-48 md:w-60 md:h-60">
            <CircularProgressbar
              value={riskScorePercent}
              text={`-`}
              styles={buildStyles({
                textColor: "#22c55e", // green-500
                pathColor: "#22c55e",
                trailColor: "#d1d5db", // gray-300
                textSize: "2.5rem",
                strokeLinecap: "round",
              })}
            />
          </div>
          <p className="text-lg md:text-xl font-medium mt-3 md:mt-5">
            {riskScore} / 10
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: May 18, 2025
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
                {industryInfo.industryRating}
              </div>
            </div>
            <div className="border border-gray-300 rounded px-2 md:px-3 py-2 text-center bg-gray-50">
              <div className="text-gray-500 text-xs mb-1">Industry Average</div>
              <div className="text-gray-900 font-semibold">
                {industryInfo.industryAverage}
              </div>
            </div>
            <div className="border border-gray-300 rounded px-2 md:px-3 py-2 text-center bg-gray-50">
              <div className="text-gray-500 text-xs mb-1">Percentile Rank</div>
              <div className="text-gray-900 font-semibold">
                {industryInfo.percentileRank}
              </div>
            </div>
            <div className="border border-gray-300 rounded px-2 md:px-3 py-2 text-center bg-gray-50">
              <div className="text-gray-500 text-xs mb-1">Industry Type</div>
              <div className="text-gray-900 font-semibold text-xs">
                {industryInfo.industryType}
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
                        className={`px-1.5 md:px-2 py-0.5 text-xs rounded-full font-semibold ${
                          item.rating === "A"
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {item.rating}
                      </span>
                      <span className="text-gray-600 font-semibold text-xs md:text-sm">
                        {item.score.toFixed(1)}
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
                      <span
                        className={`px-1.5 md:px-2 py-0.5 text-xs rounded-full font-semibold ${
                          item.rating === "A"
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {item.rating}
                      </span>
                      <span className="text-gray-600 font-semibold text-xs md:text-sm">
                        {item.score.toFixed(1)}
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

export default BlankRiskDashboard;
