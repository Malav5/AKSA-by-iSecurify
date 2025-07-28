import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from "recharts";
import QueAns, { questions as questionnaireQuestions } from "./QueAns";
import { useNavigate } from "react-router-dom";

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
  MSOAR: "Managed Security Operations and Response - Provides 24/7 security monitoring and response.",
  CSM: "Configuration Security Management - Ensures secure configuration of systems and applications.",
};

const getBarColor = (score, index, selectedSolutions) => {
  const relatedSolutions = questionnaireQuestions[index]?.relatedSolutions || [];

  if (selectedSolutions.some((sol) => relatedSolutions.includes(sol))) {
    return "#8b5cf6"; // Purple highlight
  }

  if (score >= 8) return "#10b981"; // Emerald
  if (score >= 6) return "#f59e0b"; // Amber
  if (score >= 4) return "#f97316"; // Orange
  return "#ef4444"; // Red
};

const YOUR_SOLUTIONS = ["Freemium"];
const PURCHASE_SOLUTIONS = ["TVM", "MFA", "SEM", "EBM", "SAT", "IRM", "ITAM", "MSOAR", "CSM"];

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

const SolutionTooltip = ({ solution }) => (
  <div className="absolute z-20 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-48 md:w-56 -top-2 left-full ml-3 backdrop-blur-sm">
    <h3 className="font-bold text-gray-800 mb-2 text-sm">
      {solution}
    </h3>
    <p className="text-xs text-gray-600 leading-relaxed">{SOLUTION_DESCRIPTIONS[solution]}</p>
  </div>
);

const SuggestedProducts = ({ domain }) => {
  const navigate = useNavigate();

  const getUserKey = (key) => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split("@")[0] : "";
    return `${userPrefix}_${key}`;
  };

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [hoveredSolution, setHoveredSolution] = useState(null);

  const loadAnswersAndData = () => {
    const savedAnswers = localStorage.getItem(getUserKey("domainHealthAnswers"));
    if (savedAnswers) {
      const parsedAnswers = JSON.parse(savedAnswers);
      setAnswers(parsedAnswers);
      setQuestionnaireSubmitted(true);
    } else {
      setAnswers({});
      setQuestionnaireSubmitted(false);
    }
  };

  useEffect(() => {
    loadAnswersAndData();

    const handleStorageChange = (event) => {
      if (event.key === getUserKey("domainHealthAnswers")) {
        loadAnswersAndData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
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
      prev.includes(solution) ? prev.filter((s) => s !== solution) : [...prev, solution]
    );
  };

  const handleClearSelection = () => setSelectedSolutions([]);

  const handleBuyClick = () => {
    navigate("/upgrade-plan");
  };

  return (
    <div className="bg-white text-gray-900 rounded-2xl px-6 md:px-8 lg:px-10 py-6 md:py-8 mx-2 md:mx-4 shadow-lg border border-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-transparent rounded-full -translate-y-20 translate-x-20 opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100 to-transparent rounded-full translate-y-16 -translate-x-16 opacity-30"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 bg-gradient-to-b from-[#800080] to-[#d181d1] rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Score Distribution</h2>
        </div>
        <button
          onClick={handleBuyClick}
          className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white rounded-xl px-6 md:px-8 py-3 font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Buy Solutions Now
        </button>
      </div>

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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#a5b4fc", opacity: 0.15 }} />
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

      {/* Solutions section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-8 md:mt-10 gap-6 md:gap-8">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
            <h3 className="font-bold text-lg md:text-xl text-gray-800">Your Solutions</h3>
          </div>
          <div className="flex gap-3 md:gap-4 flex-wrap">
            {YOUR_SOLUTIONS.map((sol) => (
              <button
                key={sol}
                className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 text-emerald-700 rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold text-sm md:text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {sol}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
            <h3 className="font-bold text-lg md:text-xl text-gray-800">Purchase Solutions</h3>
          </div>
          <div className="flex gap-3 md:gap-4 flex-wrap">
            {PURCHASE_SOLUTIONS.map((sol) => (
              <button
                key={sol}
                onClick={() => handleSolutionClick(sol)}
                onMouseEnter={() => setHoveredSolution(sol)}
                onMouseLeave={() => setHoveredSolution(null)}
                className={`relative rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold text-sm md:text-base shadow-md transition-all duration-300 transform hover:scale-105 ${
                  selectedSolutions.includes(sol)
                    ? "bg-gradient-to-r from-[#800080] to-[#a242a2] text-white hover:from-purple-700 hover:to-blue-700 shadow-lg"
                    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300"
                }`}
              >
                {sol}
                {hoveredSolution === sol && <SolutionTooltip solution={sol} />}
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
