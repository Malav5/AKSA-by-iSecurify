import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import QueAns from "../components/Dashboard/QueAns";
import { fetchRiskData } from "../services/DashboardServices";
import { ComplianceScore } from "../components/Dashboard/ComplianceScore";
import { ComplianceScoreCard } from "../components/Dashboard/ComplianceScoreCard";
import AksaSecurityServices from "../components/Dashboard/Services";
import SuggestedProducts from "../components/Dashboard/SuggestedProducts";
import RiskDashboard from "../components/Dashboard/RiskDashboard";
import IssueManagement from "../components/Dashboard/IssueManagement";
import TaskManagement from "../components/Dashboard/TaskManagement";
import RiskMangement from "../components/Dashboard/RiskManagement";
import OptionsMenu from "../components/Dashboard/OptionsMenu";
import BlankRiskDashboard from "../components/Dashboard/BlankRiskDashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import "react-circular-progressbar/dist/styles.css";
import "../index.css";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireVersion, setQuestionnaireVersion] = useState(0);
  const latestRequestId = useRef(0); // Ref to track latest request initiated by useEffect
  const apiControllerRef = useRef(null); // Ref to hold the active AbortController

  // Helper to get user-specific key
  const getUserKey = (key) => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';
    return `${userPrefix}_${key}`;
  };

  // ✅ Initialize state from localStorage
  const [domainName, setDomainName] = useState(
    () => {
      const currentUser = localStorage.getItem("currentUser");
      const userPrefix = currentUser ? currentUser.split('@')[0] : '';
      return localStorage.getItem(getUserKey("savedDomain")) || "";
    }
  );
  const [isDomainChecked, setIsDomainChecked] = useState(
    () => {
      const currentUser = localStorage.getItem("currentUser");
      const userPrefix = currentUser ? currentUser.split('@')[0] : '';
      return localStorage.getItem(getUserKey("domainChecked")) === "true";
    }
  );
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(
    () => {
      const currentUser = localStorage.getItem("currentUser");
      const userPrefix = currentUser ? currentUser.split('@')[0] : '';
      return localStorage.getItem(getUserKey("questionnaireSubmitted")) === "true";
    }
  );
  const [domainCheckResult, setDomainCheckResult] = useState(
    () => {
      const currentUser = localStorage.getItem("currentUser");
      const userPrefix = currentUser ? currentUser.split('@')[0] : '';
      return localStorage.getItem(getUserKey("domainCheckResult")) || "";
    }
  );

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
        const userPrefix = user.email.split('@')[0];

        if (lastUser === user.email) {
          // Returning user - load all saved data
          const savedDomain = localStorage.getItem(getUserKey("savedDomain"));
          if (savedDomain) {
            setDomainName(savedDomain);
          }
          setIsDomainChecked(localStorage.getItem(getUserKey("domainChecked")) === "true");
          setDomainCheckResult(localStorage.getItem(getUserKey("domainCheckResult")) || "");
          setQuestionnaireSubmitted(localStorage.getItem(getUserKey("questionnaireSubmitted")) === "true");
        } else {
          // New user - start with empty state
          localStorage.setItem("currentUser", user.email);
          setDomainName("");
          setIsDomainChecked(false);
          setDomainCheckResult("");
          setQuestionnaireSubmitted(false);
        }
      } catch (err) {
        console.error("Failed to fetch user for localStorage check", err);
      }
    };
    fetchAndCheckUser();

    sessionStorage.setItem("dashboardVisited", "true");
  }, []);

  // ✅ Sync each state value to localStorage on change
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';
    localStorage.setItem(getUserKey("savedDomain"), domainName);
  }, [domainName]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';
    localStorage.setItem(getUserKey("domainChecked"), isDomainChecked);
  }, [isDomainChecked]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';
    localStorage.setItem(getUserKey("questionnaireSubmitted"), questionnaireSubmitted);
  }, [questionnaireSubmitted]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';
    localStorage.setItem(getUserKey("domainCheckResult"), domainCheckResult);
  }, [domainCheckResult]);

  // Listen for questionnaire data changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      const currentUser = localStorage.getItem("currentUser");
      const userPrefix = currentUser ? currentUser.split('@')[0] : '';
      if (e.key === getUserKey("domainHealthAnswers") || e.key === getUserKey("domainHealthScore")) {
        setQuestionnaireVersion(prev => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Fetch domain data if all conditions are met (and manage AbortController)
  useEffect(() => {
    // Create a new AbortController for this effect run
    const controller = new AbortController();
    apiControllerRef.current = controller; // Store the new controller in the ref
    const signal = controller.signal;

    const requestId = Date.now(); // Generate a unique ID for this request
    latestRequestId.current = requestId; // Update the ref with the latest request ID

    const getData = async () => {
      if (!domainName || !isDomainChecked || !questionnaireSubmitted) {
        if (requestId === latestRequestId.current) { // Only set loading to false if this is the latest intended state
          setApiLoading(false);
        }
        return;
      }

      if (requestId !== latestRequestId.current) { // If a newer request has started, do not proceed
        return;
      }

      setApiLoading(true);
      try {
        const result = await fetchRiskData(domainName, { signal });

        // Only update state if this is still the latest request
        if (requestId === latestRequestId.current) {
          if (result.success) {
            setIsDomainChecked(true);
          } else {
            console.error("Error during domain check:", result.error);
            setDomainCheckResult(`Failed to check domain health: ${result.error}`);
            setIsDomainChecked(false);
          }
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request cancelled:', err.message);
        } else {
          console.error("Failed to fetch domain data:", err);
          // Only update state if this is still the latest request
          if (requestId === latestRequestId.current) {
            setDomainCheckResult("Failed to fetch domain data");
            setIsDomainChecked(false);
          }
        }
      } finally {
        // Only stop loading if this is still the latest request
        if (requestId === latestRequestId.current) {
          setApiLoading(false);
        }
      }
    };

    getData();

    return () => {
      // Abort the controller that was active during the last effect run
      if (apiControllerRef.current) {
        apiControllerRef.current.abort();
        apiControllerRef.current = null; // Clear the ref after aborting
      }
    };
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
    const currentUser = localStorage.getItem("currentUser");
    const userPrefix = currentUser ? currentUser.split('@')[0] : '';

    // If domain has changed, clear all dependent state and localStorage data
    if (newDomain !== domainName) {
      // Immediately reset UI state
      setIsDomainChecked(false);
      setQuestionnaireSubmitted(false);
      setDomainCheckResult("");
      setLoading(false); // Stop the 'Check' button loader
      setApiLoading(false); // Stop the main API loading indicator
      localStorage.removeItem(getUserKey("domainChecked"));
      localStorage.removeItem(getUserKey("questionnaireSubmitted"));
      localStorage.removeItem(getUserKey("domainCheckResult"));
      localStorage.removeItem(getUserKey("domainHealthAnswers"));
      localStorage.removeItem(getUserKey("domainHealthScore"));
      localStorage.removeItem(getUserKey("domainHealthStatus"));
      localStorage.removeItem(getUserKey("recommendedProducts"));
    }

    setDomainName(newDomain);
    localStorage.setItem(getUserKey("savedDomain"), newDomain);
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

    if (apiControllerRef.current) {
      apiControllerRef.current.abort();
      apiControllerRef.current = null; // Clear the ref after aborting
    }

    const controller = new AbortController();
    apiControllerRef.current = controller; // Store the new controller in the ref
    const signal = controller.signal;

    setLoading(true);
    setApiLoading(true);

    try {
      const result = await fetchRiskData(domainName, { signal });

      // Only update state if this specific request was not aborted
      if (controller.signal.aborted === false) {
        if (result.success) {
          setIsDomainChecked(true);
        } else {
          console.error("Error during domain check:", result.error);
          alert("Failed to check domain health.");
          setDomainCheckResult(`Failed to check domain health: ${result.error}`);
          setIsDomainChecked(false);
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Manual check request cancelled:', error.message);
      } else {
        console.error("Error during domain check:", error);
        alert("Failed to check domain health.");
      }
    } finally {
      // Always reset loading states for this manual check
      setLoading(false);
      setApiLoading(false);
      // Clear the ref if this was the last active controller for a manual check
      if (apiControllerRef.current === controller) {
        apiControllerRef.current = null;
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleDomainCheck();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Sidebar - Now responsive with mobile menu */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <Header />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-4 lg:p-6">
          {/* Alert Banner - Removed as per request */}

          {/* Domain Input Section - Improved mobile layout */}
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-0 sm:flex sm:flex-col lg:flex-row sm:gap-4 sm:items-stretch">
            {/* Domain Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter Domain Name"
                value={domainName}
                onChange={handleDomainChange}
                onKeyDown={handleKeyDown}
                className="w-full p-3 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base"
              />
              {domainName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-xs sm:text-sm hidden sm:block">Press Enter to check</span>
                </div>
              )}
            </div>

            {/* Action Buttons - Stacked on mobile, side by side on larger screens */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleDomainCheck}
                disabled={loading}
                className="bg-primary text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="hidden sm:inline">Check Domain</span>
                <span className="sm:hidden">Check</span>
              </button>

              <button
                onClick={() => setShowQuestionnaire(true)}
                className="bg-gray-800 text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Domain Health Questionnaire</span>
                <span className="sm:hidden">Questionnaire</span>
              </button>
            </div>
          </div>

          {/* Loading State - Improved mobile layout */}
          {apiLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] shadow-sm m-3 sm:m-6 rounded-lg bg-white p-4 sm:p-6">
              <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-spin mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg text-gray-600 text-center">Analyzing domain security...</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 text-center">This may take a few moments</p>
            </div>
          ) : isDomainChecked ? (
            /* Domain Analysis Results - Improved mobile layout */
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Domain Analysis Results</h2>
                <RiskDashboard domain={domainName} />
              </div>
            </div>
          ) : (
            /* Blank Risk Dashboard - Improved mobile layout */
            <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <BlankRiskDashboard />
            </div>
          )}

          {/* Compliance Score and Services Section - Improved responsive grid */}
          <div className="my-4 sm:my-6 space-y-4 sm:space-y-6 bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 mb-6 sm:mb-10">
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
                <div className="lg:col-span-2">
                  <SuggestedProducts domain={domainName} />
                </div>
              ) : (
                <div className="lg:col-span-2">
                  <AksaSecurityServices />
                </div>
              )}
            </div>
          </div>

          {/* Management Sections - Improved mobile layout */}
          {isDomainChecked && (
            <div className="space-y-4 sm:space-y-6">
              <IssueManagement />
              <TaskManagement />
              <RiskMangement />
              <OptionsMenu />
            </div>
          )}

          {/* Footer - Improved mobile layout */}
          {!isDomainChecked && (
            <div className="border-t border-gray-200 mt-6 sm:mt-10 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-gray-400">
              ©2024 AKSA by iSecurify. All Rights Reserved.
            </div>
          )}
        </div>
      </div>

      {/* Questionnaire Modal */}
      {showQuestionnaire && (
        <QueAns
          onCancel={() => setShowQuestionnaire(false)}
          setQuestionnaireSubmitted={handleQuestionnaireSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;