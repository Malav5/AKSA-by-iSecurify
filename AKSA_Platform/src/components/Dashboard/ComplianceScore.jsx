import React, { useState, useEffect } from "react";
import QueAns from "./QueAns";
import { ComplianceScoreCard } from "./ComplianceScoreCard";

const ComplianceScore = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
  const [userKey, setUserKey] = useState("");

  // Helper to get user-specific key
  const getUserKey = (key) => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split("@")[0] : "";
    return `${userPrefix}_${key}`;
  };

  // On mount and when user changes, check if questionnaire is submitted
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split("@")[0] : "";
    setUserKey(userPrefix);
    const submittedFlag = localStorage.getItem(
      `${userPrefix}_questionnaireSubmitted`
    );
    setQuestionnaireSubmitted(submittedFlag === "true");
  }, [localStorage.getItem("currentUser")]);

  // Listen for storage events to update view live
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === getUserKey("questionnaireSubmitted")) {
        setQuestionnaireSubmitted(
          localStorage.getItem(getUserKey("questionnaireSubmitted")) === "true"
        );
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [userKey]);

  // Render logic
  if (questionnaireSubmitted) {
    return <ComplianceScoreCard />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full max-w-xl mx-auto">
      <h2 className="text-gray-800 font-semibold text-lg mb-6 text-center sm:text-left">
        Compliance Score
      </h2>

      {/* Responsive Half-Round Gauge */}
      <div className="relative w-full flex justify-center items-center">
        <div className="w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[120px] sm:h-[150px] md:h-[175px] lg:h-[200px] bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-t-full relative flex items-center justify-center">
          {/* Score display */}
        </div>
      </div>

      {/* Labels under arc */}
      <div className="flex justify-between px-6 sm:px-12 mt-4 text-gray-700 font-medium text-xs sm:text-sm">
        <span>D</span>
        <span>C</span>
        <span>B</span>
        <span>A</span>
      </div>

      {/* Awaiting score */}
      <div className="text-gray-500 mt-4 text-center font-medium text-sm sm:text-base">
        Awaiting score...
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setShowQuestionnaire(true)}
          className="bg-primary hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors duration-200"
        >
          Take Assessment
        </button>
      </div>

      {showQuestionnaire && (
        <QueAns
          onCancel={() => setShowQuestionnaire(false)}
          setQuestionnaireSubmitted={() => {
            setShowQuestionnaire(false);
            setQuestionnaireSubmitted(true);
          }}
        />
      )}
    </div>
  );
};

export default ComplianceScore;
