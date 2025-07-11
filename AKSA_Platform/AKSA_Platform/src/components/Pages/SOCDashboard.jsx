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
import Navbar from "../SOCDashboard/Navbar";
import DeviceManagement from "../SOCDashboard/DeviceManagement";
import AgentStatusSummary from "../SOCDashboard/AgentStatusSummary";
import AlertsAndMetrics from "../SOCDashboard/AlertsAndMetrics";
import LatestAlerts from "../SOCDashboard/LatestAlerts";
import SeverityBreakdown from "../SOCDashboard/SeverityBreakdown";
import ComplianceStatus from "../SOCDashboard/ComplianceStatus";
import RuleCategoryChart from "../SOCDashboard/RuleCategoryChart";
import MITREAttackMap from "../SOCDashboard/MITREAttackMap";
import Vulnerabilities from "../SOCDashboard/Vulnerabilities";
import AddAgentModal from "../SOCDashboard/AddAgentModal";
import RemoveAgentModal from "../SOCDashboard/RemoveAgentModal";
import { fetchAllAlerts, runFimScan, getFimResults, clearFimResults, getLastFimScanDatetime, fetchAgents } from "../../services/SOCservices";
import axios from 'axios'; // Added for OpenAI API integration
import { getOpenAIApiKey } from '../../utils/apiKey';
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

// ScanComponent for FIM scan actions
const ScanComponent = () => {
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('result');
  const [fimThreadId, setFimThreadId] = useState(null);
  const [fimAssistantReply, setFimAssistantReply] = useState('');
  const [agentThreads, setAgentThreads] = useState({});

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/wazuh/agents');
        const wazuhAgents = res.data.data.affected_items || [];
        setAgents(wazuhAgents);
        if (wazuhAgents.length > 0) setAgentId(wazuhAgents[0].id);
      } catch (err) {
        console.error('Failed to fetch agents from Wazuh:', err);
        setAgents([]);
      }
    };
    loadAgents();
  }, []);

  useEffect(() => {
    if (!fimThreadId) {
      createThread().then(setFimThreadId);
    }
  }, [fimThreadId]);

  useEffect(() => {
    setFimAssistantReply('');
    setScanResult(null);
  }, [agentId]);

  const getOrCreateThreadForAgent = async (agentId) => {
    if (agentThreads[agentId]) return agentThreads[agentId];
    const newThreadId = await createThread();
    setAgentThreads((prev) => ({ ...prev, [agentId]: newThreadId }));
    return newThreadId;
  };

  const handleAction = async (action) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setFimAssistantReply('');
    try {
      const threadIdToUse = await getOrCreateThreadForAgent(agentId);
      if (action === 'scan') {
        await runFimScan();
      } else if (action === 'get') {
        const res = await getFimResults(agentId);
        setScanResult(res);
        setActiveTab('result');
        if (threadIdToUse && res) {
          setFimAssistantReply('Loading...');
          try {
            const msgToSend = `Summarize the following FIM scan result in simple terms:\n\n${JSON.stringify(trimFimResult(res), null, 2)}`;
            await createMessage(threadIdToUse, msgToSend);
            const runId = await createRun(threadIdToUse, ASSISTANT_ID);
            let runStatus = 'queued';
            while (runStatus !== 'completed' && runStatus !== 'failed') {
              await new Promise((res) => setTimeout(res, 1500));
              const run = await getRun(threadIdToUse, runId);
              runStatus = run.status;
            }
            const allMsgs = await getMessages(threadIdToUse);
            const assistantMsgs = allMsgs.filter((m) => m.role === 'assistant');
            const lastMsg = assistantMsgs.sort((a, b) => b.created_at - a.created_at)[0];
            if (lastMsg) setFimAssistantReply(lastMsg.content[0].text.value);
            else setFimAssistantReply('No assistant reply received.');
          } catch (err) {
            setFimAssistantReply('Assistant error: ' + (err?.response?.data?.error?.message || err.message || 'Unknown error'));
          }
        }
      } else if (action === 'clear') {
        await clearFimResults(agentId);
        setScanResult(null);
      } else if (action === 'last') {
        const res = await getLastFimScanDatetime(agentId);
        if (threadIdToUse && res) {
          setFimAssistantReply('Loading...');
          try {
            const msgToSend = `Summarize the following FIM last scan datetime:\n\n${JSON.stringify(trimFimResult(res), null, 2)}`;
            await createMessage(threadIdToUse, msgToSend);
            const runId = await createRun(threadIdToUse, ASSISTANT_ID);
            let runStatus = 'queued';
            while (runStatus !== 'completed' && runStatus !== 'failed') {
              await new Promise((res) => setTimeout(res, 1500));
              const run = await getRun(threadIdToUse, runId);
              runStatus = run.status;
            }
            const allMsgs = await getMessages(threadIdToUse);
            const assistantMsgs = allMsgs.filter((m) => m.role === 'assistant');
            const lastMsg = assistantMsgs.sort((a, b) => b.created_at - a.created_at)[0];
            if (lastMsg) setFimAssistantReply(lastMsg.content[0].text.value);
            else setFimAssistantReply('No assistant reply received.');
          } catch (err) {
            setFimAssistantReply('Assistant error: ' + (err?.response?.data?.error?.message || err.message || 'Unknown error'));
          }
        }
      }
    } catch (err) {
      setError('Action failed: ' + (err?.response?.data?.error?.message || err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">FIM Scan Manager</h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="border rounded-lg px-4 py-2 text-lg w-100"
          disabled={loading}
        >
          {agents.length === 0 && <option>Loading agents...</option>}
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name ? `${agent.name} (${agent.id})` : agent.id}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => handleAction('scan')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm"
            disabled={loading}
          >
            Run Scan
          </button>
          <button
            onClick={() => handleAction('get')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm"
            disabled={loading || !agentId}
          >
            Get Result
          </button>
          <button
            onClick={() => handleAction('clear')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm"
            disabled={loading || !agentId}
          >
            Clear Result
          </button>
          <button
            onClick={() => handleAction('last')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow text-sm"
            disabled={loading || !agentId}
          >
            Last Scan Time
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`rounded px-4 py-2 text-sm ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {error || success}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Assistant Summary</h3>
        <div className="bg-gray-100 text-gray-800 rounded-lg p-4 shadow-inner min-h-[80px] whitespace-pre-line text-base">
          {fimAssistantReply || 'No FIM result loaded.'}
        </div>
      </div>

     
    </div>
  );
};


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

  if (loading) return <div>Loading...</div>;

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
      <div className=" px-4 sm:px-6 lg:px-8 py-8 relative scrollbar-hide pt-20 flex-1 overflow-y-auto">
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