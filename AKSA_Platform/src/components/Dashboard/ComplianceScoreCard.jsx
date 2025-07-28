import React, { useEffect, useState } from "react";
import QueAns from "./QueAns"; // Import the questionnaire component

export const ComplianceScoreCard = ({ questionnaireVersion }) => {
  // Helper to get user-specific key
  const getUserKey = (key) => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split("@")[0] : "";
    return `${userPrefix}_${key}`;
  };

  const [complianceScore, setComplianceScore] = useState(null);
  const [healthStatus, setHealthStatus] = useState("");
  const [lastVersion, setLastVersion] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false); // State for modal visibility
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(
    () => localStorage.getItem(getUserKey("questionnaireSubmitted")) === "true"
  );

  // Function to update score from localStorage
  const updateScoreFromStorage = () => {
    const savedScore = localStorage.getItem(getUserKey("domainHealthScore"));
    if (savedScore !== null) {
      const score = parseInt(savedScore);
      setComplianceScore(score);

      // Set health status based on score
      if (score >= 90) {
        setHealthStatus("Excellent – Secure, well-configured, and trusted.");
      } else if (score >= 75) {
        setHealthStatus("Good – Minor improvements needed.");
      } else if (score >= 50) {
        setHealthStatus("Fair – Needs several fixes.");
      } else {
        setHealthStatus("Poor – At risk of security or deliverability issues.");
      }
    } else {
      // Reset state if no score is found (e.g., after clearing local storage)
      setComplianceScore(null);
      setHealthStatus("");
    }
  };

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === getUserKey("questionnaireSubmitted")) {
        setQuestionnaireSubmitted(
          localStorage.getItem(getUserKey("questionnaireSubmitted")) === "true"
        );
      }
      if (e.key === getUserKey("domainHealthScore")) {
        updateScoreFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update score when questionnaire version changes or on initial load
  useEffect(() => {
    if (questionnaireVersion !== lastVersion || complianceScore === null) {
      setLastVersion(questionnaireVersion);
      updateScoreFromStorage();
    }
  }, [questionnaireVersion, lastVersion, complianceScore]);

  const complianceLevel = () => {
    if (complianceScore === null) return "-";
    if (complianceScore >= 90) return "A";
    if (complianceScore >= 75) return "B";
    if (complianceScore >= 50) return "C";
    return "D";
  };

  const getScoreColor = () => {
    if (complianceScore === null) return "text-gray-500";
    if (complianceScore >= 90) return "text-emerald-600";
    if (complianceScore >= 75) return "text-blue-600";
    if (complianceScore >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = () => {
    if (complianceScore === null) return "bg-gray-100";
    if (complianceScore >= 90) return "bg-emerald-50";
    if (complianceScore >= 75) return "bg-blue-50";
    if (complianceScore >= 50) return "bg-amber-50";
    return "bg-red-50";
  };

  const getScoreBorderColor = () => {
    if (complianceScore === null) return "border-gray-200";
    if (complianceScore >= 90) return "border-emerald-200";
    if (complianceScore >= 75) return "border-blue-200";
    if (complianceScore >= 50) return "border-amber-200";
    return "border-red-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
      
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
          <h2 className="text-gray-800 font-bold text-xl md:text-2xl">
            Compliance Score
          </h2>
        </div>
        {/* Retake Assessment Button */}
        <button
          onClick={() => setShowQuestionnaire(true)}
          className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white rounded-xl px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Retake Assessment
        </button>
      </div>

      {questionnaireSubmitted ? (
        <>
          <div className="relative w-full flex justify-center mb-6">
            <div className="relative">
              {/* Main gauge */}
              <div className="w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px] bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 rounded-t-full relative shadow-lg">
                <div className="absolute inset-0 flex flex-col justify-center items-center mt-8 sm:mt-10 md:mt-12">
                  <span
                    className={`text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-lg ${getScoreColor()}`}
                  >
                    {complianceLevel()}
                  </span>
                  <span className="text-lg md:text-xl font-semibold text-gray-800 mt-2 drop-shadow-sm">
                    {complianceScore !== null ? `${complianceScore}/100` : ""}
                  </span>
                </div>
              </div>
              
              {/* Gauge reflection effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent rounded-t-full"></div>
            </div>
          </div>

          {/* Grade labels */}
          <div className="flex justify-between px-8 sm:px-12 md:px-16 mb-6 text-gray-700 font-bold text-sm md:text-base">
            <div className="flex flex-col items-center gap-1">
              <span className="text-red-600">D</span>
              <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-amber-600">C</span>
              <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-blue-600">B</span>
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-emerald-600">A</span>
              <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          {complianceScore !== null && (
            <div className={`mt-6 p-6 rounded-2xl border-2 ${getScoreBgColor()} ${getScoreBorderColor()}`}>
              <div className="text-center">
                <div
                  className={`font-bold text-base md:text-lg mb-2 ${getScoreColor()}`}
                >
                  {healthStatus}
                </div>
                <div className="text-sm md:text-base text-gray-600">
                  Based on your questionnaire responses
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-full p-6 mb-4 inline-block">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-semibold text-lg md:text-xl mb-2">
            Complete Assessment
          </p>
          <p className="text-gray-500 text-sm md:text-base">
            Take the questionnaire to get your compliance score
          </p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Assessment
          </button>
        </div>
      )}

      {/* Render QueAns modal */}
      {showQuestionnaire && (
        <QueAns
          onCancel={() => setShowQuestionnaire(false)}
          setQuestionnaireSubmitted={() => {
            setShowQuestionnaire(false);
            setQuestionnaireSubmitted(true);
            updateScoreFromStorage();
          }}
        />
      )}
    </div>
  );
};
