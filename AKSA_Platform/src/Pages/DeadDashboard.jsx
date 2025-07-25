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
} from "chart.js";
import "react-circular-progressbar/dist/styles.css";
import AksaSecurityServices from "../components/Dashboard/Services";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend);

const DeadDashboard = () => {
  const navigate = useNavigate();

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
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Security Analysis Results
              </h2>
              <RiskDashboard />
            </div>
          </div>
          <div className="my-6 space-y-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 mb-10">
              <ComplianceScore />
              <div className="col-span-2">
                <AksaSecurityServices />
              </div>
            </div>
          </div>
          <div className="text-center py-10">
            <p className="text-gray-600">
              All content will be shown here when you add a domain in your
              profile
            </p>
          </div>
          <div className="border-t border-gray-200 mt-10 pt-6 text-center text-sm text-gray-400">
            ©2024 AKSA by iSecurify. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadDashboard;
