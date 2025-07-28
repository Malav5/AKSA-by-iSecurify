import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import QueAns from "../components/Dashboard/QueAns";
import ComplianceScore from "../components/Dashboard/ComplianceScore";
import SuggestedProducts from "../components/Dashboard/SuggestedProducts";
import RiskDashboard from "../components/Dashboard/RiskDashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import "react-circular-progressbar/dist/styles.css";
import AksaSecurityServices from "../components/Dashboard/Services";
import { ComplianceScoreCard } from "../components/Dashboard/ComplianceScoreCard";
import IssueManagement from "../components/Dashboard/IssueManagement";
import RiskManagement from "../components/Dashboard/RiskManagement";
import TaskManagement from "../components/Dashboard/TaskManagement";
import OptionsMenu from "../components/Dashboard/OptionsMenu";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const Deaddashboard1 = () => {
  const navigate = useNavigate();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const handleQuestionnaireSubmit = () => {
    setShowQuestionnaire(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
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
          {/* <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Domain Health Questionnaire
            </button>
          </div> */}

          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <RiskDashboard />
            </div>
          </div>

          <div className="my-6 space-y-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 mb-10">
              <ComplianceScoreCard />
              <div className="col-span-2">
                <SuggestedProducts />
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <IssueManagement />
            <TaskManagement />
            <RiskManagement />
            <OptionsMenu />
          </div>

          <div className="border-t border-gray-200 mt-10 pt-6 text-center text-sm text-gray-400">
            ©2024 AKSA by iSecurify. All Rights Reserved.
          </div>
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

export default Deaddashboard1;