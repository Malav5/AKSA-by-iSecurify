import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import QueAns, { questions as questionnaireQuestions } from "./QueAns";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const QUESTION_LABELS = Array.from({ length: 20 }, (_, i) => `C${i + 1}`);

const GRADE_MAPPING = {
  10: "A",
  5: "B",
  0: "C",
  "-1": "D",
};

const SOLUTION_DESCRIPTIONS = {
  TVM: "Threat and Vulnerability Management - Comprehensive solution for identifying, assessing, and remediating security vulnerabilities across your infrastructure.",
  MFA: "Multi-Factor Authentication - Adds an extra layer of security to protect against unauthorized access.",
  SEM: "Security Event Management - Centralizes and analyzes security events for better threat detection.",
  EBM: "Endpoint Behavior Monitoring - Monitors and analyzes endpoint activities for suspicious behavior.",
  SAT: "Security Awareness Training - Educates employees on security best practices and threat awareness.",
  IRM: "Incident Response Management - Streamlines the process of handling security incidents.",
  ITAM: "IT Asset Management - Tracks and manages IT assets throughout their lifecycle.",
  MSOAR:
    "Managed Security Operations and Response - Provides 24/7 security monitoring and response.",
  CSM: "Configuration Security Management - Ensures secure configuration of systems and applications.",
};

const getBarColor = (score, index, selectedSolutions) => {
  const relatedSolutions =
    questionnaireQuestions[index]?.relatedSolutions || [];

  if (selectedSolutions.some((sol) => relatedSolutions.includes(sol))) {
    return "#8b5cf6"; // Purple highlight
  }

  if (score >= 8) return "#10b981"; // Emerald
  if (score >= 6) return "#f59e0b"; // Amber
  if (score >= 4) return "#f97316"; // Orange
  return "#ef4444"; // Red
};

const YOUR_SOLUTIONS = ["Freemium"];
const PURCHASE_SOLUTIONS = [
  "TVM",
  "MFA",
  "SEM",
  "EBM",
  "SAT",
  "IRM",
  "ITAM",
  "MSOAR",
  "CSM",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const grade = GRADE_MAPPING[payload[0].value] || "N/A";
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 backdrop-blur-sm">
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        <p className="text-gray-600 text-sm">
          Grade: <span className="font-bold text-purple-600">{grade}</span>
        </p>
      </div>
    );
  }
  return null;
};

const SolutionTooltip = ({ solution, position, buttonRect }) => {
  if (!buttonRect) return null;

  const tooltipStyle = {
    position: "fixed",
    zIndex: 99999,
    top: buttonRect.top + buttonRect.height / 2,
    left: position === "right" ? buttonRect.right + 12 : buttonRect.left - 200,
    transform: "translateY(-50%)",
  };

  const tooltipContent = (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-48 md:w-56 backdrop-blur-sm"
      style={tooltipStyle}
    >
      <h3 className="font-bold text-gray-800 mb-2 text-sm">{solution}</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        {SOLUTION_DESCRIPTIONS[solution]}
      </p>
    </div>
  );

  return createPortal(tooltipContent, document.body);
};

const SuggestedProducts = ({ domain }) => {
  const navigate = useNavigate();

  // Fetch userPlan from backend and localStorage
  const [userPlan, setUserPlan] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // Fallback to localStorage if no token
          const plan = localStorage.getItem("plan");
          setUserPlan(plan || "Freemium");
          setIsLoadingPlan(false);
          return;
        }

        const response = await fetch("http://localhost:3000/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const plan = data.user.plan || "Freemium";
          setUserPlan(plan);
          // Update localStorage with the latest plan
          localStorage.setItem("plan", plan);
        } else {
          // Fallback to localStorage if API call fails
          const plan = localStorage.getItem("plan");
          setUserPlan(plan || "Freemium");
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
        // Fallback to localStorage if there's an error
        const plan = localStorage.getItem("plan");
        setUserPlan(plan || "Freemium");
      } finally {
        setIsLoadingPlan(false);
      }
    };

    fetchUserPlan();

    // Listen for plan changes in localStorage
    const handlePlanChange = (event) => {
      if (event.key === "plan") {
        setUserPlan(event.newValue || "Freemium");
      }
    };

    window.addEventListener("storage", handlePlanChange);

    // Refresh plan when component becomes visible (user navigates back to dashboard)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUserPlan();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handlePlanChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Improved user key generation with better error handling
  const getUserKey = (key) => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) {
        console.warn("No current user found in localStorage");
        return `anonymous_${key}`;
      }
      // Use the full email as the key to avoid conflicts
      const sanitizedEmail = currentUser.replace(/[^a-zA-Z0-9@._-]/g, "_");
      return `user_${sanitizedEmail}_${key}`;
    } catch (error) {
      console.error("Error generating user key:", error);
      return `error_${key}`;
    }
  };

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [hoveredSolution, setHoveredSolution] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState("right");
  const [buttonRect, setButtonRect] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Function to suggest products based on questionnaire answers
  const suggestProducts = (answers) => {
    const suggestions = [];

    // Check each question and suggest solutions based on low scores
    if (answers.q1 === 0 || answers.q2 === 0) suggestions.push("ITAM");
    if (answers.q3 === 0 || answers.q4 === 0 || answers.q12 === 0)
      suggestions.push("CSM");
    if (answers.q5 === 0 || answers.q6 === 0 || answers.q18 === 0)
      suggestions.push("MSOAR");
    if (answers.q7 === 0 || answers.q17 === 0 || answers.q20 === 0)
      suggestions.push("TVM");
    if (answers.q8 === 0 || answers.q9 === 0 || answers.q10 === 0)
      suggestions.push("SEM");
    if (answers.q11 === 0 || answers.q16 === 0) suggestions.push("IRM");
    if (answers.q13 === 0) suggestions.push("SAT");
    if (answers.q14 === 0 || answers.q15 === 0) suggestions.push("EBM");
    if (answers.q19 === 0) suggestions.push("MFA");

    // Calculate overall score to suggest additional solutions
    const totalScore = Object.values(answers).reduce(
      (sum, val) => (val !== null && val !== -1 ? sum + val : sum),
      0
    );
    const percentage = Math.round((totalScore / 200) * 100);

    // If overall score is low, suggest more comprehensive solutions
    if (percentage < 50) {
      if (!suggestions.includes("TVM")) suggestions.push("TVM");
      if (!suggestions.includes("SEM")) suggestions.push("SEM");
      if (!suggestions.includes("MSOAR")) suggestions.push("MSOAR");
    }

    return [...new Set(suggestions)]; // Remove duplicates
  };

  const loadAnswersAndData = () => {
    try {
      const savedAnswers = localStorage.getItem(
        getUserKey("domainHealthAnswers")
      );
      const savedSubmitted = localStorage.getItem(
        getUserKey("questionnaireSubmitted")
      );

      if (savedAnswers && savedSubmitted === "true") {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
        setQuestionnaireSubmitted(true);

        // Generate recommendations based on answers
        const recommendations = suggestProducts(parsedAnswers);
        setRecommendedProducts(recommendations);

        // Auto-select recommended products
        setSelectedSolutions(recommendations);
      } else {
        setAnswers({});
        setQuestionnaireSubmitted(false);
        setRecommendedProducts([]);
        setSelectedSolutions([]);
      }
    } catch (error) {
      console.error("Error loading answers and data:", error);
      setAnswers({});
      setQuestionnaireSubmitted(false);
      setRecommendedProducts([]);
      setSelectedSolutions([]);
    }
  };

  useEffect(() => {
    loadAnswersAndData();

    const handleStorageChange = (event) => {
      if (
        event.key === getUserKey("domainHealthAnswers") ||
        event.key === getUserKey("questionnaireSubmitted")
      ) {
        loadAnswersAndData();
      }
    };

    const handleQuestionnaireSubmitted = (e) => {
      console.log(
        "Questionnaire submitted event received in SuggestedProducts:",
        e.detail
      );
      loadAnswersAndData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "questionnaireSubmitted",
      handleQuestionnaireSubmitted
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "questionnaireSubmitted",
        handleQuestionnaireSubmitted
      );
    };
  }, []);

  // Check for user changes and reload data
  useEffect(() => {
    const handleUserChange = () => {
      loadAnswersAndData();
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

  const chartData = QUESTION_LABELS.map((label, idx) => {
    const qKey = `q${idx + 1}`;
    const score = answers[qKey] !== undefined ? answers[qKey] : 0;
    return {
      label,
      score,
      fill: getBarColor(score, idx, selectedSolutions),
    };
  });

  const yTicks = [10, 5, 0, -1];
  const yTickFormatter = (value) => GRADE_MAPPING[value] || "";

  const handleSolutionClick = (solution) => {
    setSelectedSolutions((prev) =>
      prev.includes(solution)
        ? prev.filter((s) => s !== solution)
        : [...prev, solution]
    );
  };

  const handleClearSelection = () => setSelectedSolutions([]);

  const handleBuyClick = () => {
    navigate("/upgrade-plan");
  };

  const handleSolutionHover = (solution, event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // Check if tooltip would go off screen to the right
    if (rect.right + 200 > windowWidth) {
      setTooltipPosition("left");
    } else {
      setTooltipPosition("right");
    }

    setButtonRect(rect);
    setHoveredSolution(solution);
  };

  const handleSolutionLeave = () => {
    setHoveredSolution(null);
    setButtonRect(null);
  };

  // Function to refresh user plan
  const refreshUserPlan = async () => {
    setIsLoadingPlan(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const plan = localStorage.getItem("plan");
        setUserPlan(plan || "Freemium");
        setIsLoadingPlan(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const plan = data.user.plan || "Freemium";
        setUserPlan(plan);
        localStorage.setItem("plan", plan);
      } else {
        const plan = localStorage.getItem("plan");
        setUserPlan(plan || "Freemium");
      }
    } catch (error) {
      console.error("Error refreshing user plan:", error);
      const plan = localStorage.getItem("plan");
      setUserPlan(plan || "Freemium");
    } finally {
      setIsLoadingPlan(false);
    }
  };

  return (
    <div className="bg-white text-gray-900 rounded-2xl px-6 md:px-8 lg:px-10 py-6 md:py-8 mx-2 md:mx-4 shadow-lg border border-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-transparent rounded-full -translate-y-20 translate-x-20 opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100 to-transparent rounded-full translate-y-16 -translate-x-16 opacity-30"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Score Distribution
          </h2>
        </div>
        <button
          onClick={handleBuyClick}
          className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white rounded-xl px-6 md:px-8 py-3 font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Buy Solutions Now
        </button>
      </div>

      {!questionnaireSubmitted ? (
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
            Complete Assessment First
          </p>
          <p className="text-gray-500 text-sm md:text-base mb-4">
            Take the questionnaire to get personalized solution recommendations
          </p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <>
          <div className="w-full h-72 md:h-96 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 md:p-8 border border-gray-200 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                barSize={18}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#4B5563", fontWeight: 600, fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[-1, 10]}
                  ticks={yTicks}
                  tickFormatter={yTickFormatter}
                  tick={{ fill: "#4B5563", fontWeight: 600, fontSize: 11 }}
                  tickLine={false}
                  width={35}
                  interval={0}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#a5b4fc", opacity: 0.15 }}
                />
                <Bar
                  dataKey="score"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive
                  fill="#6366f1"
                  minPointSize={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recommended Solutions section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="font-bold text-lg text-gray-800">
                  Recommended for You
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Based on your assessment, we recommend these solutions to
                improve your security posture:
              </p>
              <div className="flex gap-3 flex-wrap">
                {recommendedProducts.map((sol) => (
                  <button
                    key={sol}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-2 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {sol}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Solutions section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-8 md:mt-10 gap-6 md:gap-8">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                <h3 className="font-bold text-lg md:text-xl text-gray-800">
                  Your Solutions
                </h3>
                <button
                  onClick={refreshUserPlan}
                  disabled={isLoadingPlan}
                  className="ml-2 p-1 text-emerald-600 hover:text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  title="Refresh plan"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-3 md:gap-4 flex-wrap">
                {/* Show user plan from backend/localStorage */}
                {isLoadingPlan ? (
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 text-emerald-700 rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold text-sm md:text-base shadow-md animate-pulse">
                    Loading...
                  </div>
                ) : (
                  <button className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 text-emerald-700 rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold text-sm md:text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    {userPlan}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="font-bold text-lg md:text-xl text-gray-800">
                  Purchase Solutions
                </h3>
              </div>
              <div className="flex gap-3 md:gap-4 flex-wrap">
                {PURCHASE_SOLUTIONS.map((sol) => (
                  <button
                    key={sol}
                    onClick={() => handleSolutionClick(sol)}
                    onMouseEnter={(e) => handleSolutionHover(sol, e)}
                    onMouseLeave={handleSolutionLeave}
                    className={`relative rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold text-sm md:text-base shadow-md transition-all duration-300 transform hover:scale-105 ${selectedSolutions.includes(sol)
                      ? "bg-gradient-to-r from-[#800080] to-[#a242a2] text-white hover:from-purple-700 hover:to-blue-700 shadow-lg"
                      : recommendedProducts.includes(sol)
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-2 border-blue-300"
                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300"
                      }`}
                  >
                    {sol}
                    {recommendedProducts.includes(sol) && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        ★
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedSolutions.length > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline font-medium transition-colors duration-200"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Render tooltip using portal */}
      {hoveredSolution && (
        <SolutionTooltip
          solution={hoveredSolution}
          position={tooltipPosition}
          buttonRect={buttonRect}
        />
      )}

      {/* Questionnaire Modal */}
      {showQuestionnaire && (
        <QueAns
          onCancel={() => setShowQuestionnaire(false)}
          setQuestionnaireSubmitted={() => {
            setShowQuestionnaire(false);
            loadAnswersAndData();
          }}
        />
      )}
    </div>
  );
};

export default SuggestedProducts;
