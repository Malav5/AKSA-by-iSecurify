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
    if (complianceScore === null) return "text-gray-500"; // Or a neutral color
    if (complianceScore >= 90) return "text-green-600";
    if (complianceScore >= 75) return "text-blue-600";
    if (complianceScore >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white shadow rounded-lg p-3 md:p-4 lg:p-6 w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-gray-800 font-semibold text-base md:text-lg text-left">
          Compliance Score
        </h2>
        {/* Retake Assessment Button */}
        <button
          onClick={() => setShowQuestionnaire(true)}
          className="text-primary rounded-md px-2 md:px-3 py-1 text-xs md:text-sm font-medium shadow-sm hover:bg-primary/10 transition-colors"
        >
          Retake Assessment
        </button>
      </div>

      {questionnaireSubmitted ? (
        <>
          <div className="relative w-full flex justify-center">
            <div className="w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[120px] sm:h-[150px] md:h-[175px] lg:h-[200px] bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-t-full relative">
              <div className="absolute inset-0 flex flex-col justify-center items-center mt-6 sm:mt-8 md:mt-10">
                <span
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold ${getScoreColor()}`}
                >
                  {complianceLevel()}
                </span>
                <span className="text-base md:text-lg font-medium text-gray-800 mt-1">
                  {complianceScore !== null ? `${complianceScore}/100` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between px-6 sm:px-8 md:px-16 mt-3 md:mt-4 text-gray-700 font-medium text-xs md:text-sm">
            <span>D</span>
            <span>C</span>
            <span>B</span>
            <span>A</span>
          </div>

          {complianceScore !== null && (
            <div className="mt-3 md:mt-4 space-y-2">
              <div
                className={`text-center font-semibold text-xs md:text-sm lg:text-base ${getScoreColor()}`}
              >
                {healthStatus}
              </div>
              <div className="text-center text-xs md:text-sm text-gray-600">
                Based on your questionnaire responses
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-500 mt-4 text-center font-medium text-xs md:text-sm lg:text-base">
          Complete the questionnaire to get your compliance score
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
