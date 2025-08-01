import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import moment from 'moment';
import Navbar from "../components/SOCDashboard/Navbar";
import DeviceManagement from "../components/SOCDashboard/DeviceManagement";  
import AgentStatusSummary from "../components/SOCDashboard/AgentStatusSummary";
import AlertsAndMetrics from "../components/SOCDashboard/AlertsAndMetrics";
import LatestAlerts from "../components/SOCDashboard/LatestAlerts";
import SeverityBreakdown from "../components/SOCDashboard/SeverityBreakdown";
import ComplianceStatus from "../components/SOCDashboard/ComplianceStatus";
import RuleCategoryChart from "../components/SOCDashboard/RuleCategoryChart";
import MITREAttackMap from "../components/SOCDashboard/MITREAttackMap"
import AddAgentModal from "../components/SOCDashboard/AddAgentModal";
import RemoveAgentModal from "../components/SOCDashboard/RemoveAgentModal";
import { fetchAllAlerts, runFimScan, getFimResults, clearFimResults, getLastFimScanDatetime, fetchAgents } from "../services/SOCservices";
import axios from 'axios'; // Added for OpenAI API integration
import { getOpenAIApiKey } from '../utils/apiKey';
import ScanComponent from "../components/SOCDashboard/ScanComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (name.length > 1) {
    return name.substring(0, 2).toUpperCase();
  } else {
    return name.toUpperCase();
  }
};

// OpenAI API integration for FIM scan assistant
const OPENAI_API_KEY = getOpenAIApiKey();
const ASSISTANT_ID = 'asst_sMop8t3yxFEFynVJCBpt5bQC';
const OPENAI_BETA_HEADER = { 'OpenAI-Beta': 'assistants=v2' };
const BASE_URL = 'https://api.openai.com/v1';
const fimApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    ...OPENAI_BETA_HEADER,
  },
});
async function createThread() {
  const res = await fimApi.post('/threads', {});
  return res.data.id;
}
async function createMessage(threadId, content) {
  const res = await fimApi.post(`/threads/${threadId}/messages`, {
    role: 'user',
    content,
  });
  return res.data.id;
}
async function createRun(threadId, assistantId) {
  const res = await fimApi.post(`/threads/${threadId}/runs`, {
    assistant_id: assistantId,
  });
  return res.data.id;
}
async function getRun(threadId, runId) {
  const res = await fimApi.get(`/threads/${threadId}/runs/${runId}`);
  return res.data;
}
async function getMessages(threadId) {
  const res = await fimApi.get(`/threads/${threadId}/messages`);
  return res.data.data;
}

// Utility to aggressively trim FIM result JSON before sending to assistant
function trimFimResult(data, depth = 0) {
  if (depth > 2) return '[Truncated]';
  if (Array.isArray(data)) {
    if (data.length > 2) {
      return data.slice(0, 2).map(item => trimFimResult(item, depth + 1)).concat(['...omitted']);
    }
    return data.map(item => trimFimResult(item, depth + 1));
  }
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    const trimmed = {};
    keys.slice(0, 2).forEach(key => {
      trimmed[key] = trimFimResult(data[key], depth + 1);
    });
    if (keys.length > 2) trimmed['...omitted'] = true;
    return trimmed;
  }
  return data;
}


const SOCDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("soc_username") || "");
  const [fullname, setFullname] = useState(localStorage.getItem("soc_fullname") || "");
  const [wazuhData, setWazuhData] = useState({ alerts: [], agentSummary: {} });
  const [alertLevelChartData, setAlertLevelChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [agentAlertChartData, setAgentAlertChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [alertsOverTimeChartData, setAlertsOverTimeChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [alertSummary, setAlertSummary] = useState({
    total: 0,
    highSeverity: 0,
    agentsCount: 0,
    ruleTypesCount: 0,
    topAgents: [],
    topRules: [],
    latestAlerts: [],
  });
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showRemoveAgentModal, setShowRemoveAgentModal] = useState(false);
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data fetching function for Agent Summary and Alerts
  const fetchWazuhData = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const now = moment();
        const alertsData = [
          {
            id: "1001",
            rule: { description: "Multiple failed logins" },
            agent: { name: "webserver01" },
            timestamp: now.clone().subtract(10, 'minutes').toISOString(),
            level: 10,
          },
          {
            id: "2005",
            rule: { description: "SSH brute force attack" },
            agent: { name: "database01" },
            timestamp: now.clone().subtract(25, 'minutes').toISOString(),
            level: 12,
          },
          {
            id: "5002",
            rule: { description: "Root access via SSH" },
            agent: { name: "critical-server" },
            timestamp: now.clone().subtract(30, 'minutes').toISOString(),
            level: 14,
          },
        ];

        const agentSummaryData = {
          total: 50,
          active: 45,
          disconnected: 3,
          pending: 2,
          neverConnected: 0,
        };

        resolve({ alerts: alertsData, agentSummary: agentSummaryData });
      }, 500);
    });
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("soc_username");
    const storedFullname = localStorage.getItem("soc_fullname");


    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedFullname) {
      setFullname(storedFullname);
    }

    const getWazuhData = async () => {
      const data = await fetchWazuhData();
      setWazuhData(data);
      const alerts = data.alerts;

      // Process data for Level chart
      const levelCounts = alerts.reduce((acc, alert) => {
        acc[alert.level] = (acc[alert.level] || 0) + 1;
        return acc;
      }, {});

      const sortedLevels = Object.keys(levelCounts).sort((a, b) => a - b);
      const counts = sortedLevels.map(level => levelCounts[level]);

      setAlertLevelChartData({
        labels: sortedLevels.map(level => `Level ${level}`),
        datasets: [
          {
            label: 'Number of Alerts',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      });

      // Process data for Agent chart
      const agentCounts = alerts.reduce((acc, alert) => {
        const agentName = alert.agent.name;
        acc[agentName] = (acc[agentName] || 0) + 1;
        return acc;
      }, {});

      const agentNames = Object.keys(agentCounts);
      const agentCountsArray = agentNames.map(name => agentCounts[name]);

      setAgentAlertChartData({
        labels: agentNames,
        datasets: [
          {
            label: 'Alerts per Agent',
            data: agentCountsArray,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      });

      // Process data for Alerts Over Time chart
      const alertsByMinute = alerts.reduce((acc, alert) => {
        const minute = moment(alert.timestamp).format('HH:mm');
        acc[minute] = (acc[minute] || 0) + 1;
        return acc;
      }, {});

      const sortedMinutes = Object.keys(alertsByMinute).sort();
      const alertsPerMinuteCount = sortedMinutes.map(minute => alertsByMinute[minute]);

      setAlertsOverTimeChartData({
        labels: sortedMinutes,
        datasets: [
          {
            label: 'Alerts Over Time',
            data: alertsPerMinuteCount,
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.1,
          },
        ],
      });

      // Calculate summary data
      const totalAlerts = alerts.length;
      const highSeverityAlerts = alerts.filter(alert => alert.level >= 10).length;
      const uniqueAgents = new Set(alerts.map(alert => alert.agent.name)).size;
      const uniqueRuleTypes = new Set(alerts.map(alert => alert.rule.description)).size;

      const sortedAgents = Object.entries(agentCounts).sort(([, a], [, b]) => b - a);
      const topAgentsList = sortedAgents.slice(0, 5);

      const ruleCounts = alerts.reduce((acc, alert) => {
        const ruleDesc = alert.rule.description;
        acc[ruleDesc] = (acc[ruleDesc] || 0) + 1;
        return acc;
      }, {});

      const sortedRules = Object.entries(ruleCounts).sort(([, a], [, b]) => b - a);
      const topRulesList = sortedRules.slice(0, 5);

      const latestAlertsList = alerts
        .sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf())
        .slice(0, 10);

      setAlertSummary({
        total: totalAlerts,
        highSeverity: highSeverityAlerts,
        agentsCount: uniqueAgents,
        ruleTypesCount: uniqueRuleTypes,
        topAgents: topAgentsList,
        topRules: topRulesList,
        latestAlerts: latestAlertsList,
      });
    };
    getWazuhData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const alertsData = await fetchAllAlerts();
      const alerts = alertsData.hits?.hits?.map(hit => hit._source) || [];
      setAllAlerts(alerts);
      setLoading(false);
    };
    fetchData();
  }, []);

  const alertsOverTimeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Alerts Over Time',
      },
    },
    scales: {
      x: {
        type: 'category',
      },
      y: {
        beginAtZero: true,
        precision: 0,
      },
    },
    maintainAspectRatio: false,
  };

  const handleSOCLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("soc_username");
    localStorage.removeItem("soc_fullname");
    navigate("/soc-login");
  };

  if (loading) return (
    <div className="bg-white p-6 mb-8 flex justify-center items-center h-full">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#800080] border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-sm">Loading rule category data...</p>
      </div>
    </div>
  );


  if (allAlerts.length > 0) {
    const getLevel = a => a.rule?.level ?? a.level ?? 0;
    console.log('DASHBOARD allAlerts severity counts:', {
      critical: allAlerts.filter(a => getLevel(a) >= 12).length,
      high: allAlerts.filter(a => getLevel(a) >= 8 && getLevel(a) < 12).length,
      medium: allAlerts.filter(a => getLevel(a) >= 4 && getLevel(a) < 8).length,
      low: allAlerts.filter(a => getLevel(a) < 4).length,
      total: allAlerts.length
    });
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-800 relative overflow-hidden scrollbar-hide">
      <Navbar username={username} fullname={fullname} />
      <div className=" px-4 mx-40 sm:px-6 lg:px-8 py-8 relative scrollbar-hide pt-20 flex-1 overflow-y-auto">
        {/* Device Management */}
        <DeviceManagement onAddAgent={() => setShowAddAgentModal(true)} onRemoveAgent={() => setShowRemoveAgentModal(true)} />

        {/* FIM Scan Component */}


        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4 ">Security Dashboard</h2>

          {/* Agent Status Summary */}
          <AgentStatusSummary agentSummary={wazuhData.agentSummary} />

          {/* Charts and Metrics */}
          <AlertsAndMetrics
            alertsOverTimeChartOptions={alertsOverTimeChartOptions}
            alertsOverTimeChartData={alertsOverTimeChartData}
            topAgents={alertSummary.topAgents}

            alertLevelChartData={alertLevelChartData}

            agentAlertChartData={agentAlertChartData}
            topRules={alertSummary.topRules}
          />
          <ScanComponent />
          {/* Latest Alerts */}
          <LatestAlerts latestAlerts={alertSummary.latestAlerts} />
          <SeverityBreakdown alerts={allAlerts} />
          <ComplianceStatus alertSummary={alertSummary} />
          <RuleCategoryChart topRules={alertSummary.topRules} />
          <MITREAttackMap topRules={alertSummary.topRules} />
          {/* <LogDetail /> */}


        </div>
      </div>
      {/* Add Agent Modal with improved container for scrollability */}
      {showAddAgentModal && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-sm" />
          <AddAgentModal visible={showAddAgentModal} onClose={() => setShowAddAgentModal(false)} onAdd={() => { }} />
        </>
      )}
      {showRemoveAgentModal && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-sm" />
          <RemoveAgentModal visible={showRemoveAgentModal} onClose={() => setShowRemoveAgentModal(false)} />
        </>
      )}
    </div>
  );
};

export default SOCDashboard; 