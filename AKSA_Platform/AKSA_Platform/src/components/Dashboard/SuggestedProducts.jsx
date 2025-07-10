import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";
import QueAns, { questions as questionnaireQuestions } from "./QueAns";

const QUESTION_LABELS = Array.from({ length: 20 }, (_, i) => `C${i + 1}`);

// Define grade mapping
const GRADE_MAPPING = {
  10: 'A',
  5: 'B',
  0: 'C',
  '-1': 'D'
};

// Solution descriptions
const SOLUTION_DESCRIPTIONS = {
  TVM: "Threat and Vulnerability Management - Comprehensive solution for identifying, assessing, and remediating security vulnerabilities across your infrastructure.",
  MFA: "Multi-Factor Authentication - Adds an extra layer of security to protect against unauthorized access.",
  SEM: "Security Event Management - Centralizes and analyzes security events for better threat detection.",
  EBM: "Endpoint Behavior Monitoring - Monitors and analyzes endpoint activities for suspicious behavior.",
  SAT: "Security Awareness Training - Educates employees on security best practices and threat awareness.",
  IRM: "Incident Response Management - Streamlines the process of handling security incidents.",
  ITAM: "IT Asset Management - Tracks and manages IT assets throughout their lifecycle.",
  MSOAR: "Managed Security Operations and Response - Provides 24/7 security monitoring and response.",
  CSM: "Configuration Security Management - Ensures secure configuration of systems and applications."
};

const getBarColor = (score, index, selectedSolutions) => {
  // Get related solutions from the imported questions data
  const relatedSolutions = questionnaireQuestions[index]?.relatedSolutions || [];

  if (selectedSolutions.some(sol => relatedSolutions.includes(sol))) {
    return "#800080"; 
  }

  // Original color based on score if not highlighted
  if (score >= 8) return "#34d399"; // Green
  if (score >= 6) return "#fbbf24"; // Yellow
  if (score >= 4) return "#f59e42"; // Orange
  return "#f87171"; // Red
};

const YOUR_SOLUTIONS = ["Freemium"];
const PURCHASE_SOLUTIONS = ["TVM", "MFA", "SEM", "EBM", "SAT", "IRM", "ITAM", "MSOAR", "CSM"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const grade = GRADE_MAPPING[payload[0].value] || 'N/A';
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 md:px-4 py-2">
        <p className="font-semibold text-gray-800 text-xs md:text-sm">{label}</p>
        <p className="text-gray-600 text-xs md:text-sm">Grade: <span className="font-bold">{grade}</span></p>
      </div>
    );
  }
  return null;
};

const SolutionTooltip = ({ solution }) => {
  return (
    <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 md:p-3 w-40 md:w-50 -top-2 left-full ml-2">
      <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-sm">{solution}</h3>
      <p className="text-xs md:text-sm text-gray-600">{SOLUTION_DESCRIPTIONS[solution]}</p>
    </div>
  );
};

const SuggestedProducts = ({ domain }) => {
  // Helper to get user-specific key
  const getUserKey = (key) => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';
    return `${userPrefix}_${key}`;
  };

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [hoveredSolution, setHoveredSolution] = useState(null);

  // Function to load answers and update chart data
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

  // Load initial data and set up storage listener
  useEffect(() => {
    loadAnswersAndData();

    const handleStorageChange = (event) => {
      if (event.key === getUserKey("domainHealthAnswers")) {
        loadAnswersAndData(); // Reload data when answers change in local storage
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); 

  // Prepare data for recharts (derived from answers state)
  const chartData = QUESTION_LABELS.map((label, idx) => {
    const qKey = `q${idx + 1}`;
    const score = answers[qKey] !== undefined ? answers[qKey] : 0;
    return {
      label,
      score,
      fill: getBarColor(score, idx, selectedSolutions)
    };
  });

  // Y-axis ticks for grades
  const yTicks = [10, 5, 0, -1];
  const yTickFormatter = (value) => GRADE_MAPPING[value] || '';

  const handleSolutionClick = (solution) => {
    setSelectedSolutions(prevSelected => {
      if (prevSelected.includes(solution)) {
        // Deselect if already selected
        return prevSelected.filter(item => item !== solution);
      } else {
        // Select the solution
        return [...prevSelected, solution];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedSolutions([]);
  };

  return (
    <div className="bg-white text-gray-900 rounded-2xl px-4 md:px-6 lg:px-8 py-4 md:py-6 mx-2 md:mx-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Score Distribution</h2>
        <button
          className="bg-primary text-white rounded-lg px-4 md:px-6 py-2 font-medium text-sm md:text-lg shadow-md transition hover:bg-primary/90"
        >
          Buy Solutions Now
        </button>
      </div>
      <div className="w-full h-64 md:h-80 bg-gray-50 rounded-xl p-3 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            barSize={16}
          >
            <XAxis dataKey="label" tick={{ fill: '#4B5563', fontWeight: 600, fontSize: 10 }} tickLine={false} />
            <YAxis
              domain={[-1, 10]}
              ticks={yTicks}
              tickFormatter={yTickFormatter}
              tick={{ fill: '#4B5563', fontWeight: 600, fontSize: 10 }}
              tickLine={false}
              width={30}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#a5b4fc", opacity: 0.15 }} />
            <Bar 
              dataKey="score" 
              radius={[3, 3, 0, 0]} 
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
      {/* Solutions Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-6 md:mt-8 gap-4 md:gap-8">
        <div className="flex flex-col items-start">
          <div className="font-semibold mb-2 text-sm md:text-base">Your solutions</div>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            {YOUR_SOLUTIONS.map((sol) => (
              <button
                key={sol}
                className="bg-white border-2 border-primary text-primary rounded-lg px-3 md:px-4 py-1.5 md:py-2 font-semibold text-sm md:text-base shadow-sm hover:bg-purple-50 transition"
              >
                {sol}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div className="font-semibold mb-2 text-sm md:text-base">Purchase solutions</div>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            {PURCHASE_SOLUTIONS.map((sol) => (
              <button
                key={sol}
                onClick={() => handleSolutionClick(sol)}
                onMouseEnter={() => setHoveredSolution(sol)}
                onMouseLeave={() => setHoveredSolution(null)}
                className={`relative rounded-lg px-3 md:px-4 py-1.5 md:py-2 font-semibold text-sm md:text-base shadow-sm transition ${
                  selectedSolutions.includes(sol)
                    ? "bg-primary text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sol}
                {hoveredSolution === sol && (
                  <SolutionTooltip solution={sol} />
                )}
              </button>
            ))}
          </div>
          {selectedSolutions.length > 0 && (
            <button
              onClick={handleClearSelection}
              className="mt-2 text-xs md:text-sm text-gray-500 hover:text-gray-700 underline"
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
            loadAnswersAndData(); // Load updated data after submission
          }}
        />
      )}
    </div>
  );
};

export default SuggestedProducts;
