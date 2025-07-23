import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import QueAns from "../Dashboard/QueAns";
import { fetchDomainData } from "../DashboardServices";
import { ComplianceScore } from "../DeadDashboard/ComplianceScore";
import { ComplianceScoreCard } from "../Dashboard/ComplianceScoreCard";
import SecurityRoadmap from "../Dashboard/SecurityRoadmap";
import AksaSecurityServices from "../DeadDashboard/Services";
import DomainHealthSummary from "../Dashboard/DomainHealthSummary";
import Footer from "../Dashboard/DomainDetail";
import DomainRiskCard from "../DeadDashboard/DomainRiskCard";
import SuggestedProducts from "../Dashboard/SuggestedProducts";
import RiskDashboard from "../Dashboard/RiskDashboard";
import IssueManagement from "../Dashboard/IssueManagement";
import TaskManagement from "../Dashboard/TaskManagement";
import RiskMangement from "../Dashboard/RiskManagement";
import OptionsMenu from "../Dashboard/OptionsMenu";

const DeadDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if coming from login page
    // const isFromLogin = location.state?.from === "/login"; isFromLogin ||
    const isFormSignUp = location.state?.from === "/signup";

    if (isFormSignUp) {
      // Clear local storage and reset state
      localStorage.removeItem("savedDomain");
      localStorage.removeItem("domainChecked");
      localStorage.removeItem("questionnaireSubmitted");
      setDomainName("");
      setDomainCheckResult("");
      setIsDomainChecked(false);
      setQuestionnaireSubmitted(false);
    } else {
      // Load existing data from local storage
      setDomainName(localStorage.getItem("savedDomain") || "");
      setIsDomainChecked(localStorage.getItem("domainChecked") === "true");
      setQuestionnaireSubmitted(
        localStorage.getItem("questionnaireSubmitted") === "true"
      );
    }

    // Set dashboard visited flag
    sessionStorage.setItem("dashboardVisited", "true");
  }, [location]);

  useEffect(() => {
    sessionStorage.setItem("dashboardVisited", "true");
  }, []);

  const [domainName, setDomainName] = useState(
    localStorage.getItem("savedDomain") || ""
  );
  const [domainCheckResult, setDomainCheckResult] = useState("");
  const [isDomainChecked, setIsDomainChecked] = useState(
    localStorage.getItem("domainChecked") === "true"
  );
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(
    localStorage.getItem("questionnaireSubmitted") === "true"
  );
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [loading, setLoading] = useState(false); // NEW loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDomainData(domainName);
        setDomainCheckResult(
          data.message || "Domain health check result: Good."
        );
      } catch (err) {
        console.error("Failed to fetch domain data again:", err);
      }
    };

    if (domainName && isDomainChecked && questionnaireSubmitted) {
      getData();
    }
  }, [domainName, isDomainChecked, questionnaireSubmitted]);

  const goToIssueManager = () => {
    navigate("/issues");
  };

  const goToSection = (section) => {
    navigate("/issues", { state: { section, domain: domainName } });
  };

  const handleQuestionnaireSubmit = () => {
    setQuestionnaireSubmitted(true);
    setShowQuestionnaire(false);
    localStorage.setItem("questionnaireSubmitted", "true");
  };

  const handleDomainChange = (event) => {
    const newDomain = event.target.value;
    setDomainName(newDomain);
    setIsDomainChecked(false);
    setDomainCheckResult(null);
    setQuestionnaireSubmitted(false);
    localStorage.setItem("savedDomain", newDomain);
    localStorage.removeItem("domainChecked");
    localStorage.removeItem("questionnaireSubmitted");
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

    try {
      const data = await fetchDomainData(domainName);
      setDomainCheckResult(data.message || "Domain health check result: Good.");
      setIsDomainChecked(true);

      localStorage.setItem("savedDomain", domainName);
      localStorage.setItem("domainChecked", "true");
      localStorage.setItem("questionnaireSubmitted", "true");
    } catch (error) {
      console.error("Error during domain check:", error);
      alert("Failed to check domain health.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleDomainCheck();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Sidebar - Sticky */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main content with scrollable area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white">
          <Header />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-stretch">
            <input
              type="text"
              placeholder="Enter Domain Name"
              value={domainName}
              onChange={handleDomainChange}
              onKeyDown={handleKeyDown}
              className="flex-1 p-3 border border-gray-200 rounded-lg"
            />
            <button
              onClick={handleDomainCheck}
              className="bg-primary text-white px-6 py-3 rounded-lg mt-4 lg:mt-0 flex items-center justify-center gap-2"
              disabled={loading}
            >
              Check
            </button>
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg mt-4 lg:mt-0"
            >
              Domain Health Questionnaire
            </button>
          </div>

          <RiskDashboard />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 mb-10">
            {questionnaireSubmitted && domainName ? (
              <ComplianceScoreCard
                domain={domainName}
                questionnaireSubmitted={questionnaireSubmitted}
              />
            ) : (
              <ComplianceScore domain={domainName} />
            )}
            {isDomainChecked ? (
              <DomainHealthSummary goToSection={goToSection} />
            ) : (
              <AksaSecurityServices />
            )}
            {loading ? (
              <div className="flex items-center justify-center p-6 rounded-2xl text-center shadow">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-2 text-primary">
                  Scanning Domain Risk...
                </span>
              </div>
            ) : isDomainChecked ? (
              <DomainRiskCard domain={domainName} />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl text-center shadow">
                <div className="text-primary mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary">
                  Domain Risk Report Pending
                </h3>
                <p className="text-sm text-primary mt-2">
                  The Domain Risk section will populate once you complete a
                  domain health check.
                </p>
                <p className="text-sm text-primary">
                  Get insights into vulnerabilities, DNS health, email security,
                  and more.
                </p>
              </div>
            )}
          </div>

          {isDomainChecked ? (
            <Footer domain={domainName} />
          ) : loading ? (
            <div className="flex items-center justify-center p-10 rounded-2xl text-center shadow">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
              <span className="ml-2 text-primary">
                Loading Domain Health...
              </span>
            </div>
          ) : (
            <SecurityRoadmap />
          )}

          {isDomainChecked ? (
            <SuggestedProducts domain={domainName} />
          ) : (
            <div className="rounded-xl p-8 text-center shadow my-6 border border-gray-100">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Suggested Products Will Show Here
              </h3>
              <p className="text-lg text-primary mb-6">
                Please perform a domain health check to view recommended
                security tools and services.
              </p>
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
