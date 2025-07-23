import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/SOCDashboard/Navbar";
import DeviceManagement from "../components/SOCDashboard/DeviceManagement";
import AgentStatusSummary from "../components/SOCDashboard/AgentStatusSummary";
import AlertsAndMetrics from "../components/SOCDashboard/AlertsAndMetrics";
import LatestAlerts from "../components/SOCDashboard/LatestAlerts";
import SeverityBreakdown from "../components/SOCDashboard/SeverityBreakdown";
import ComplianceStatus from "../components/SOCDashboard/ComplianceStatus";
import RuleCategoryChart from "../components/SOCDashboard/RuleCategoryChart";
import MITREAttackMap from "../components/SOCDashboard/MITREAttackMap";
import { fetchAllAlerts, fetchAgents } from "../services/SOCservices";
import ScanComponent from "../components/SOCDashboard/ScanComponent";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState(localStorage.getItem("soc_fullname") || "");
  const [agents, setAgents] = useState([]);
  const [wazuhData, setWazuhData] = useState({ alerts: [], agentSummary: {} });
  const [alertLevelChartData, setAlertLevelChartData] = useState({ labels: [], datasets: [] });
  const [agentAlertChartData, setAgentAlertChartData] = useState({ labels: [], datasets: [] });
  const [alertsOverTimeChartData, setAlertsOverTimeChartData] = useState({ labels: [], datasets: [] });
  const [alertSummary, setAlertSummary] = useState({ total: 0, highSeverity: 0, agentsCount: 0, ruleTypesCount: 0, topAgents: [], topRules: [], latestAlerts: [] });
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents().then(setAgents);
  }, []);

  useEffect(() => {
    const getWazuhData = async () => {
      const data = await fetchAllAlerts();
      const alerts = data.hits?.hits?.map(hit => hit._source) || [];
      setAllAlerts(alerts);
      setLoading(false);
    };
    getWazuhData();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-800 relative overflow-hidden scrollbar-hide">
      <Navbar fullname={fullname} />
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 border-8 border-[#800080] border-t-transparent border-b-transparent rounded-full animate-spin mb-6 shadow-lg"></div>
          <div className="text-2xl font-bold text-primary mb-2">Loading User Dashboard...</div>
          <div className="text-base text-gray-600">Please wait while we fetch your security data.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-800 relative overflow-hidden scrollbar-hide">
      <Navbar fullname={fullname} />
      <div className={`px-4 mx-40 sm:px-6 lg:px-8 py-8 relative scrollbar-hide pt-20 flex-1 overflow-y-auto ${loading ? 'pointer-events-none opacity-50 select-none' : ''}`}>
        <DeviceManagement />
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4 ">Security Dashboard</h2>
          <AgentStatusSummary agentSummary={wazuhData.agentSummary} />
          <AlertsAndMetrics
            alertsOverTimeChartOptions={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Alerts Over Time' } }, scales: { x: { type: 'category' }, y: { beginAtZero: true, precision: 0 } }, maintainAspectRatio: false }}
            alertsOverTimeChartData={alertsOverTimeChartData}
            topAgents={alertSummary.topAgents}
            alertLevelChartData={alertLevelChartData}
            agentAlertChartData={agentAlertChartData}
            topRules={alertSummary.topRules}
          />
          {/* ScanComponent can be reused here if needed */}
          <ScanComponent />
          <LatestAlerts latestAlerts={alertSummary.latestAlerts} />
          <SeverityBreakdown alerts={allAlerts} />
          <ComplianceStatus alertSummary={alertSummary} />
          <RuleCategoryChart topRules={alertSummary.topRules} />
          <MITREAttackMap topRules={alertSummary.topRules} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 