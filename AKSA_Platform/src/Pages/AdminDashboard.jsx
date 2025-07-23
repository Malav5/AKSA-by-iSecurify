import React from "react";
import Navbar from "../components/SOCDashboard/Navbar";
import AgentStatusSummary from "../components/SOCDashboard/AgentStatusSummary";
import AlertsAndMetrics from "../components/SOCDashboard/AlertsAndMetrics";
import LatestAlerts from "../components/SOCDashboard/LatestAlerts";
import DeviceManagement from "../components/SOCDashboard/DeviceManagement";

const AdminDashboard = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-800 relative overflow-hidden scrollbar-hide">
      <Navbar />
      <div className="px-4 mx-40 sm:px-6 lg:px-8 py-8 relative scrollbar-hide pt-20 flex-1 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-4">Admin Security Dashboard</h2>
        {/* Device Management */}
        <div className="mb-8">
          <DeviceManagement />
        </div>
        {/* Agent Status Summary */}
        <div className="mb-8">
          <AgentStatusSummary />
        </div>
        {/* Charts and Metrics */}
        <div className="mb-8">
          <AlertsAndMetrics />
        </div>
        {/* Latest Alerts */}
        <div className="mb-8">
          <LatestAlerts />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
