import React, { useEffect, useState } from "react";
import QueAns, { questions } from "./QueAns"; // Import the questionnaire component and questions

export const ComplianceScoreCard = ({ questionnaireVersion }) => {
  // Improved user key generation with better error handling
  const getUserKey = (key) => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) {
        console.warn("No current user found in localStorage");
        return `anonymous_${key}`;
      }
      // Use the full email as the key to avoid conflicts
      const sanitizedEmail = currentUser.replace(/[^a-zA-Z0-9@._-]/g, '_');
      return `user_${sanitizedEmail}_${key}`;
    } catch (error) {
      console.error("Error generating user key:", error);
      return `error_${key}`;
    }
  };

  const [complianceScore, setComplianceScore] = useState(null);
  const [healthStatus, setHealthStatus] = useState("");
  const [lastVersion, setLastVersion] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false); // State for modal visibility
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [topIssues, setTopIssues] = useState([]);
  const [topStrengths, setTopStrengths] = useState([]);

  // Function to analyze answers and generate concise insights
  const analyzeAnswers = (answers) => {
    const categories = {
      assetManagement: { questions: [1, 2], score: 0, maxScore: 20, name: "Asset Management" },
      dataSecurity: { questions: [3, 4, 12], score: 0, maxScore: 30, name: "Data Security" },
      accessControl: { questions: [5, 6, 18], score: 0, maxScore: 30, name: "Access Control" },
      vulnerabilityManagement: { questions: [7, 17, 20], score: 0, maxScore: 30, name: "Vulnerability Management" },
      monitoring: { questions: [8, 9, 10], score: 0, maxScore: 30, name: "Security Monitoring" },
      incidentResponse: { questions: [11, 16], score: 0, maxScore: 20, name: "Incident Response" },
      training: { questions: [13], score: 0, maxScore: 10, name: "Security Training" },
      vendorManagement: { questions: [14, 15], score: 0, maxScore: 20, name: "Vendor Management" },
      authentication: { questions: [19], score: 0, maxScore: 10, name: "Multi-Factor Auth" }
    };

    // Calculate category scores
    Object.keys(categories).forEach(category => {
      const categoryData = categories[category];
      categoryData.questions.forEach(qNum => {
        const answer = answers[`q${qNum}`];
        if (answer !== null && answer !== undefined) {
          categoryData.score += answer;
        }
      });
      categoryData.percentage = Math.round((categoryData.score / categoryData.maxScore) * 100);
    });

    // Get top 3 issues (lowest scores)
    const issues = Object.entries(categories)
      .filter(([_, data]) => data.percentage < 70)
      .map(([key, data]) => ({
        category: key,
        name: data.name,
        score: data.percentage
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    // Get top 3 strengths (highest scores)
    const strengths = Object.entries(categories)
      .filter(([_, data]) => data.percentage >= 80)
      .map(([key, data]) => ({
        category: key,
        name: data.name,
        score: data.percentage
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return { issues, strengths };
  };

  // Function to update score from localStorage with better error handling
  const updateScoreFromStorage = () => {
    try {
      const savedScore = localStorage.getItem(getUserKey("domainHealthScore"));
      const savedStatus = localStorage.getItem(getUserKey("domainHealthStatus"));
      const savedSubmitted = localStorage.getItem(getUserKey("questionnaireSubmitted"));
      const savedAnswers = localStorage.getItem(getUserKey("domainHealthAnswers"));

      if (savedScore !== null && savedSubmitted === "true") {
        const score = parseInt(savedScore);
        setComplianceScore(score);
        setQuestionnaireSubmitted(true);

        // Load and analyze answers
        if (savedAnswers) {
          const parsedAnswers = JSON.parse(savedAnswers);
          setAnswers(parsedAnswers);
          const analysis = analyzeAnswers(parsedAnswers);
          setTopIssues(analysis.issues);
          setTopStrengths(analysis.strengths);
        }

        // Set health status based on score
        if (savedStatus) {
          setHealthStatus(savedStatus);
        } else {
          if (score >= 90) {
            setHealthStatus("Excellent – Secure, well-configured, and trusted.");
          } else if (score >= 75) {
            setHealthStatus("Good – Minor improvements needed.");
          } else if (score >= 50) {
            setHealthStatus("Fair – Needs several fixes.");
          } else {
            setHealthStatus("Poor – At risk of security or deliverability issues.");
          }
        }
      } else {
        // Reset state if no score is found or questionnaire not submitted
        setComplianceScore(null);
        setHealthStatus("");
        setQuestionnaireSubmitted(false);
        setAnswers({});
        setTopIssues([]);
        setTopStrengths([]);
      }
    } catch (error) {
      console.error("Error updating score from storage:", error);
      setComplianceScore(null);
      setHealthStatus("");
      setQuestionnaireSubmitted(false);
      setAnswers({});
      setTopIssues([]);
      setTopStrengths([]);
    }
  };

  // Listen for storage events and custom events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === getUserKey("questionnaireSubmitted")) {
        setQuestionnaireSubmitted(
          localStorage.getItem(getUserKey("questionnaireSubmitted")) === "true"
        );
      }
      if (e.key === getUserKey("domainHealthScore") || e.key === getUserKey("domainHealthAnswers")) {
        updateScoreFromStorage();
      }
    };

    const handleQuestionnaireSubmitted = (e) => {
      console.log("Questionnaire submitted event received:", e.detail);
      updateScoreFromStorage();
      setQuestionnaireSubmitted(true);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("questionnaireSubmitted", handleQuestionnaireSubmitted);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("questionnaireSubmitted", handleQuestionnaireSubmitted);
    };
  }, []);

  // Update score when questionnaire version changes or on initial load
  useEffect(() => {
    if (questionnaireVersion !== lastVersion || complianceScore === null) {
      setLastVersion(questionnaireVersion);
      updateScoreFromStorage();
    }
  }, [questionnaireVersion, lastVersion, complianceScore]);

  // Check for user changes and reload data
  useEffect(() => {
    const handleUserChange = () => {
      updateScoreFromStorage();
    };

    // Check for user changes every 5 seconds
    const interval = setInterval(() => {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser !== getUserKey("currentUser")) {
        handleUserChange();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 relative overflow-hidden">
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

          {/* Compact Analysis Section */}
          {Object.keys(answers).length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Issues */}
              {topIssues.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-4 bg-red-500 rounded-full"></div>
                    Priority Issues
                  </h3>
                  <div className="space-y-2">
                    {topIssues.map((issue, index) => (
                      <div key={issue.category} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{issue.name}</span>
                        <span className="text-red-600 font-bold">{issue.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Strengths */}
              {topStrengths.length > 0 && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-4 bg-emerald-500 rounded-full"></div>
                    Your Strengths
                  </h3>
                  <div className="space-y-2">
                    {topStrengths.map((strength) => (
                      <div key={strength.category} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{strength.name}</span>
                        <span className="text-emerald-600 font-bold">{strength.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Action */}
          <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-blue-800 mb-1">Next Steps</h3>
                <p className="text-xs text-gray-600">
                  {topIssues.length > 0
                    ? `Focus on improving ${topIssues[0]?.name} first`
                    : "Continue maintaining your strong security practices"
                  }
                </p>
              </div>
              <button
                onClick={() => setShowQuestionnaire(true)}
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Review
              </button>
            </div>
          </div>
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
            className="mt-4 bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
