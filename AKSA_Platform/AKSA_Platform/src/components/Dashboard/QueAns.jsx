import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// Define and export the questions array at the top level
export const questions = [
  {
    name: "q1",
    label: "1. Do you maintain an up-to-date inventory of all authorized devices connected to your network?",
    relatedSolutions: ["ITAM"]
  },
  {
    name: "q2",
    label: "2. Is there an inventory of all authorized software applications approved for use within the organization?",
    relatedSolutions: ["ITAM"]
  },
  {
    name: "q3",
    label: "3. Are sensitive data identified, classified, and protected using encryption at rest and in transit?",
    relatedSolutions: ["CSM"]
  },
  {
    name: "q4",
    label: "4. Are secure baseline configurations established and maintained for all OS and software?",
    relatedSolutions: ["CSM"]
  },
  {
    name: "q5",
    label: "5. Do you enforce the use of unique, individual accounts for all employees?",
    relatedSolutions: ["MSOAR"]
  },
  {
    name: "q6",
    label: "6. Are user permissions reviewed regularly and based on least privilege principles?",
    relatedSolutions: ["MSOAR"]
  },
  {
    name: "q7",
    label: "7. Do you run regular vulnerability scans and prioritize remediation based on risk?",
    relatedSolutions: ["TVM"]
  },
  {
    name: "q8",
    label: "8. Are system and security logs centralized, protected, and reviewed regularly?",
    relatedSolutions: ["SEM"]
  },
  {
    name: "q9",
    label: "9. Do you implement anti-phishing and content filtering for emails and browsers?",
    relatedSolutions: ["SEM"]
  },
  {
    name: "q10",
    label: "10. Is antivirus/anti-malware software installed and automatically updated across systems?",
    relatedSolutions: ["SEM"]
  },
  {
    name: "q11",
    label: "11. Are backups performed regularly, encrypted, and tested for integrity?",
    relatedSolutions: ["IRM"]
  },
  {
    name: "q12",
    label: "12. Is your network segmented and protected by properly configured firewalls?",
    relatedSolutions: ["CSM"]
  },
  {
    name: "q13",
    label: "13. Are employees required to complete security awareness training annually?",
    relatedSolutions: ["SAT"]
  },
  {
    name: "q14",
    label: "14. Do you assess third-party vendors for security practices and compliance reports?",
    relatedSolutions: ["EBM"]
  },
  {
    name: "q15",
    label: "15. Are secure development practices followed for all in-house software?",
    relatedSolutions: ["EBM"]
  },
  {
    name: "q16",
    label: "16. Do you maintain and regularly test an incident response plan?",
    relatedSolutions: ["IRM"]
  },
  {
    name: "q17",
    label: "17. Is penetration testing performed at least annually or after major changes?",
    relatedSolutions: ["TVM"]
  },
  {
    name: "q18",
    label: "18. Is there a dedicated security team managing cybersecurity operations?",
    relatedSolutions: ["MSOAR"]
  },
  {
    name: "q19",
    label: "19. Is MFA enforced for remote access and critical systems?",
    relatedSolutions: ["MFA"]
  },
  {
    name: "q20",
    label: "20. Are critical patches applied within a defined SLA across all systems?",
    relatedSolutions: ["TVM"]
  }
].map((q) => ({
  ...q,
  options: [
    { label: "A. Yes (10 pts)", value: 10 },
    { label: "B. Partially (5 pts)", value: 5 },
    { label: "C. No (0 pts)", value: 0 },
    { label: "D. Not Applicable (N/A)", value: -1 } // Unique value to fix the issue
  ]
}));

const QueAns = ({ onCancel, setQuestionnaireSubmitted }) => {
  // Helper to get user-specific key
  const getUserKey = (key) => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';
    return `${userPrefix}_${key}`;
  };

  const [answers, setAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem(getUserKey("domainHealthAnswers"));
    return savedAnswers ? JSON.parse(savedAnswers) : Object.fromEntries(questions.map((q) => [q.name, null]));
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate remaining questions
  const remainingQuestions = Object.values(answers).filter(answer => answer === null).length;
  const totalQuestions = questions.length;

  const handleAnswerChange = (question, points) => {
    const newAnswers = {
      ...answers,
      [question]: points
    };
    setAnswers(newAnswers);
    // Save to localStorage immediately when an answer changes
    localStorage.setItem(getUserKey("domainHealthAnswers"), JSON.stringify(newAnswers));
  };

  const calculateScore = () => {
    const total = Object.values(answers).reduce(
      (sum, val) => (val !== null && val !== -1 ? sum + val : sum),
      0
    );
    return Math.round((total / 200) * 100);
  };

  const getHealthStatus = (score) => {
    if (score >= 90) return "Excellent – Secure, well-configured, and trusted.";
    if (score >= 75) return "Good – Minor improvements needed.";
    if (score >= 50) return "Fair – Needs several fixes.";
    return "Poor – At risk of security or deliverability issues.";
  };

  const suggestProducts = (answers, score) => {
    const suggestions = [];
    if (answers.q1 === 0 || answers.q2 === 0) suggestions.push("ITAM");
    if (answers.q3 === 0 || answers.q4 === 0 || answers.q12 === 0) suggestions.push("CSM");
    if (answers.q5 === 0 || answers.q6 === 0 || answers.q18 === 0) suggestions.push("MSOAR");
    if (answers.q7 === 0 || answers.q16 === 0 || answers.q17 === 0) suggestions.push("TVM");
    if (answers.q9 === 0 || answers.q10 === 0) suggestions.push("SEM");
    if (answers.q13 === 0) suggestions.push("SAT");
    if (answers.q14 === 0 || answers.q15 === 0) suggestions.push("EBM");
    if (answers.q11 === 0 || answers.q16 === 0) suggestions.push("IRM");
    if (answers.q19 === 0) suggestions.push("MFA");
    if (score < 50) suggestions.push("Cyber Checkup");
    return [...new Set(suggestions)];
  };

  const handleSubmit = () => {
    if (Object.values(answers).includes(null)) {
      setErrorMessage("Please answer all questions before submitting.");
      return;
    }

    const newScore = calculateScore();
    const suggestions = suggestProducts(answers, newScore);
    const healthStatus = getHealthStatus(newScore);

    // Save all data to localStorage
    localStorage.setItem(getUserKey("domainHealthAnswers"), JSON.stringify(answers));
    localStorage.setItem(getUserKey("domainHealthScore"), newScore.toString());
    localStorage.setItem(getUserKey("domainHealthStatus"), healthStatus);
    localStorage.setItem(getUserKey("recommendedProducts"), JSON.stringify(suggestions));
    localStorage.setItem(getUserKey("questionnaireSubmitted"), "true");

    // Dispatch storage event to notify other components
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: getUserKey("domainHealthAnswers"),
        newValue: JSON.stringify(answers),
        oldValue: null,
        url: window.location.href,
        storageArea: localStorage
      })
    );

    setQuestionnaireSubmitted(true);
    onCancel();
  };

  // Load saved answers on component mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(getUserKey("domainHealthAnswers"));
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex justify-center items-center z-50 overflow-auto">
      <div className="relative bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <h1 className="text-3xl font-semibold text-center text-primary mb-6">
            Domain Health Assessment
          </h1>

          {errorMessage && (
            <div className="text-red-600 text-center mb-4">
              {errorMessage}
            </div>
          )}

          {questions.map(({ label, name, options }) => (
            <div key={name} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                {label}
              </label>
              <div className="flex flex-wrap gap-6">
                {options.map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <input
                      type="radio"
                      name={name}
                      value={opt.value}
                      checked={answers[name] === opt.value}
                      onChange={() => handleAnswerChange(name, opt.value)}
                      onClick={() => {
                        if (answers[name] === opt.value) {
                          const newAnswers = { ...answers, [name]: null };
                          setAnswers(newAnswers);
                          localStorage.setItem(getUserKey("domainHealthAnswers"), JSON.stringify(newAnswers));
                        }
                      }}
                      className="h-5 w-5 accent-primary"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 mt-6">
            <div className="flex justify-between items-center">
              <div className="text-primary font-medium">
                {remainingQuestions === 0 ? (
                  <span className="font-semibold">All questions answered! You can now submit the questionnaire.</span>
                ) : (
                  `${remainingQuestions} question${remainingQuestions === 1 ? '' : 's'} remaining`
                )}
              </div>
              <div className="text-primary text-sm">
                {totalQuestions - remainingQuestions}/{totalQuestions} completed
              </div>
            </div>
            <div className="w-full bg-primary/30 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((totalQuestions - remainingQuestions) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-xl"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueAns;

/*
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
*/
