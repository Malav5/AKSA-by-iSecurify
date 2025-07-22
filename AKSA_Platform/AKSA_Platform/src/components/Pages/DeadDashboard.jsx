import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import QueAns from "../Dashboard/QueAns";
import { fetchRiskData } from "../../services/DashboardServices";
import { ComplianceScore } from "../Dashboard/ComplianceScore";
import { ComplianceScoreCard } from "../Dashboard/ComplianceScoreCard";
import AksaSecurityServices from "../Dashboard/Services";
import SuggestedProducts from "../Dashboard/SuggestedProducts";
import RiskDashboard from "../Dashboard/RiskDashboard";
import IssueManagement from "../Dashboard/IssueManagement";
import TaskManagement from "../Dashboard/TaskManagement";
import RiskMangement from "../Dashboard/RiskManagement";
import OptionsMenu from "../Dashboard/OptionsMenu";
import BlankRiskDashboard from "../Dashboard/BlankRiskDashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import "react-circular-progressbar/dist/styles.css";
import "../../index.css";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const DeadDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireVersion, setQuestionnaireVersion] = useState(0);


  // ✅ Initialize state from localStorage
  const [domainName, setDomainName] = useState(
    () => localStorage.getItem("savedDomain") || ""
  );
  const [isDomainChecked, setIsDomainChecked] = useState(
    () => localStorage.getItem("domainChecked") === "true"
  );
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(
    () => localStorage.getItem("questionnaireSubmitted") === "true"
  );
  const [domainCheckResult, setDomainCheckResult] = useState(
    () => localStorage.getItem("domainCheckResult") || ""
  );

  // State for Winlogbeat Stats
  const [winlogbeatStats, setWinlogbeatStats] = useState(null);
  const [winlogbeatStatsLoading, setWinlogbeatStatsLoading] = useState(true);
  const [winlogbeatStatsError, setWinlogbeatStatsError] = useState(null);

  // ✅ Handle first load or coming from signup or signin
  useEffect(() => {
    // Fetch current user from backend
    const fetchAndCheckUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // Not logged in
        const response = await axios.get(
          "http://localhost:3000/api/auth/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const user = response.data.user;
        if (!user || !user.email) return;
        const lastUser = localStorage.getItem("currentUser");
        if (!lastUser || lastUser !== user.email) {
          // New user or first login, clear all data
          localStorage.setItem("currentUser", user.email);
          localStorage.removeItem("savedDomain");
          localStorage.removeItem("domainChecked");
          localStorage.removeItem("domainCheckResult");
          localStorage.removeItem("questionnaireSubmitted");
          localStorage.removeItem("domainHealthAnswers");
          localStorage.removeItem("domainHealthScore");
          localStorage.removeItem("domainHealthStatus");
          localStorage.removeItem("recommendedProducts");
          setDomainName("");
          setIsDomainChecked(false);
          setDomainCheckResult("");
          setQuestionnaireSubmitted(false);
        }
      } catch (err) {
        // If user fetch fails, treat as not logged in
        console.error("Failed to fetch user for localStorage check", err);
      }
    };
    fetchAndCheckUser();

    const fromSignup = sessionStorage.getItem("fromSignup") === "true";
    if (fromSignup) {
      // Clear all dashboard/questionnaire data
      localStorage.removeItem("savedDomain");
      localStorage.removeItem("domainChecked");
      localStorage.removeItem("domainCheckResult");
      localStorage.removeItem("questionnaireSubmitted");
      localStorage.removeItem("domainHealthAnswers");
      localStorage.removeItem("domainHealthScore");
      localStorage.removeItem("domainHealthStatus");
      localStorage.removeItem("recommendedProducts");

      setDomainName("");
      setIsDomainChecked(false);
      setDomainCheckResult("");
      setQuestionnaireSubmitted(false);

      sessionStorage.removeItem("fromSignup");
    } else {
      // Load last domain and state from localStorage
      setDomainName(localStorage.getItem("savedDomain") || "");
      setIsDomainChecked(localStorage.getItem("domainChecked") === "true");
      setDomainCheckResult(localStorage.getItem("domainCheckResult") || "");
      setQuestionnaireSubmitted(localStorage.getItem("questionnaireSubmitted") === "true");
    }
    sessionStorage.setItem("dashboardVisited", "true");

    // Fallback: If no domain is saved, ensure domainName is empty
    const savedDomain = localStorage.getItem("savedDomain");
    if (!savedDomain || savedDomain.trim() === "") {
      setDomainName("");
    }
  }, []);

  // ✅ Sync each state value to localStorage on change
  useEffect(() => {
    localStorage.setItem("savedDomain", domainName);
  }, [domainName]);

  useEffect(() => {
    localStorage.setItem("domainChecked", isDomainChecked);
  }, [isDomainChecked]);

  useEffect(() => {
    localStorage.setItem("questionnaireSubmitted", questionnaireSubmitted);
  }, [questionnaireSubmitted]);

  useEffect(() => {
    localStorage.setItem("domainCheckResult", domainCheckResult);
  }, [domainCheckResult]);

  // Listen for questionnaire data changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "domainHealthAnswers" || e.key === "domainHealthScore") {
        setQuestionnaireVersion(prev => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Fetch domain data if all conditions are met
  useEffect(() => {
    const getData = async () => {
      if (!domainName || !isDomainChecked || !questionnaireSubmitted) return;

      setApiLoading(true);
      try {
        const result = await fetchRiskData(domainName);

        if (result.success) {
          setIsDomainChecked(true);
        } else {
          console.error("Error during domain check:", result.error);
          setDomainCheckResult(`Failed to check domain health: ${result.error}`);
          setIsDomainChecked(false);
        }
      } catch (err) {
        console.error("Failed to fetch domain data:", err);
        setDomainCheckResult("Failed to fetch domain data");
        setIsDomainChecked(false);
      } finally {
        setApiLoading(false);
      }
    };

    getData();
  }, [domainName, isDomainChecked, questionnaireSubmitted]);

  const goToIssueManager = () => {
    navigate("/issues");
  };

  const handleQuestionnaireSubmit = () => {
    setQuestionnaireSubmitted(true);
    setShowQuestionnaire(false);
    setQuestionnaireVersion(prev => prev + 1);
  };

  const handleDomainChange = (event) => {
    const newDomain = event.target.value.trim();

    // If domain has changed, clear all dependent state and localStorage data
    if (newDomain !== domainName) {
      setIsDomainChecked(false);
      setQuestionnaireSubmitted(false);
      setDomainCheckResult("");

      // Clear all questionnaire-related data from localStorage
      localStorage.removeItem("domainChecked");
      localStorage.removeItem("questionnaireSubmitted");
      localStorage.removeItem("domainCheckResult");
      localStorage.removeItem("domainHealthAnswers");
      localStorage.removeItem("domainHealthScore");
      localStorage.removeItem("domainHealthStatus");
      localStorage.removeItem("recommendedProducts");
    }

    setDomainName(newDomain);
    localStorage.setItem("savedDomain", newDomain);
  };


  const handleDomainCheck = async () => {
    if (!domainName) {
      alert("Please enter a domain name.");
      return;
    }

    if (!questionnaireSubmitted) {
      alert("Please first complete the Domain Health Questionnaire.");
      return;
    }

    setLoading(true);
    setApiLoading(true);

    try {
      const result = await fetchRiskData(domainName);

      if (result.success) {
        setIsDomainChecked(true);
      } else {
        console.error("Error during domain check:", result.error);
        alert("Failed to check domain health.");
        setDomainCheckResult(`Failed to check domain health: ${result.error}`);
        setIsDomainChecked(false);
      }
    } catch (error) {
      console.error("Error during domain check:", error);
      alert("Failed to check domain health.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleDomainCheck();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden ">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-white">
          <Header />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter Domain Name"
                value={domainName}
                onChange={handleDomainChange}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              />
              {domainName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-sm">Press Enter to check</span>
                </div>
              )}
            </div>
            <button
              onClick={handleDomainCheck}
              className="bg-primary text-white px-6 py-3 rounded-lg mt-4 lg:mt-0 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Check Domain
                </>
              )}
            </button>

            <button
              onClick={() => setShowQuestionnaire(true)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg mt-4 lg:mt-0 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Domain Health Questionnaire
            </button>
          </div>

          {apiLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] shadow-sm m-6 rounded-lg bg-white">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg text-gray-600">Analyzing domain security...</p>
              <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
            </div>
          ) : isDomainChecked ? (
            <div className="mt-6 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Domain Analysis Results</h2>
                <RiskDashboard domain={domainName} />
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <BlankRiskDashboard />
            </div>
          )}
          <div className="my-6 space-y-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 mb-10">
              {questionnaireSubmitted && domainName ? (
                <ComplianceScoreCard
                  domain={domainName}
                  questionnaireSubmitted={questionnaireSubmitted}
                  questionnaireVersion={questionnaireVersion}
                />
              ) : (
                <ComplianceScore domain={domainName} />
              )}

              {isDomainChecked ? (
                <div className="col-span-2">
                  <SuggestedProducts domain={domainName} />
                </div>
              ) : (
                <div className="col-span-2">
                  <AksaSecurityServices />
                </div>
              )}
            </div>
          </div>
          {/* {isDomainChecked && <DomainDetail domain={domainName} />} */}
          {isDomainChecked && (
            <>
              <IssueManagement />
              <TaskManagement />
              <RiskMangement />
              <OptionsMenu />
            </>
          )}


          {!isDomainChecked && (
            <div className="border-t border-gray-200 mt-10 pt-6 text-center text-sm text-gray-400">
              ©2024 AKSA by iSecurify. All Rights Reserved.
            </div>
          )}
        </div>
      </div>

      {showQuestionnaire && (
        <QueAns
          onCancel={() => setShowQuestionnaire(false)}
          setQuestionnaireSubmitted={handleQuestionnaireSubmit}
        />
      )}
    </div>
  );
};

export default DeadDashboard;
