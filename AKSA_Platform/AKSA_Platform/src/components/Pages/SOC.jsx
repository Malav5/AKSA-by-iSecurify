import React, { useState, useEffect } from "react";
import { Eye, FileText, ShieldCheck, Zap, BarChart2, Layers, Activity, Users, ShieldAlert, Sliders, ListChecks, FileBarChart, ShieldHalf, BookOpen, Scale } from "lucide-react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import DeviceManagement from "../SOC/DeviceManagement";
import AgentStatusSummary from "../SOC/AgentStatusSummary";
import AlertsAndMetrics from "../SOC/AlertsAndMetrics";
import SecurityInfoCards from "../SOC/SecurityInfoCards";
import LatestAlerts from "../SOC/LatestAlerts";
import AlertSeverityBreakdown from "../SOC/AlertSeverityBreakdown";
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
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

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
        {
          id: "1001",
          rule: { description: "Multiple failed logins" },
          agent: { name: "webserver02" },
          timestamp: now.clone().subtract(5, 'minutes').toISOString(),
          level: 10,
        },
        {
          id: "2005",
          rule: { description: "SSH brute force attack" },
          agent: { name: "webserver01" },
          timestamp: now.clone().subtract(18, 'minutes').toISOString(),
          level: 12,
        },
        {
          id: "3003",
          rule: { description: "Unusual network activity" },
          agent: { name: "database01" },
          timestamp: now.clone().subtract(40, 'minutes').toISOString(),
          level: 7,
        },
        {
          id: "1001",
          rule: { description: "Multiple failed logins" },
          agent: { name: "webserver02" },
          timestamp: now.clone().subtract(2, 'minutes').toISOString(),
          level: 10,
        },
        {
          id: "4004",
          rule: { description: "Web server error" },
          agent: { name: "webserver01" },
          timestamp: now.clone().subtract(15, 'minutes').toISOString(),
          level: 5,
        },
        {
          id: "4004",
          rule: { description: "Web server error" },
          agent: { name: "webserver03" },
          timestamp: now.clone().subtract(12, 'minutes').toISOString(),
          level: 5,
        },
      ];

      // Mock Agent Summary Data
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

const SOC = () => {
  const navigate = useNavigate();
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

  const handleGoToMainDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
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

      // Process data for Alerts Over Time chart (simple minute-based for mock)
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

      // Calculate summary data and top lists
      const totalAlerts = alerts.length;
      const highSeverityAlerts = alerts.filter(alert => alert.level >= 10).length;
      const uniqueAgents = new Set(alerts.map(alert => alert.agent.name)).size;
      const uniqueRuleTypes = new Set(alerts.map(alert => alert.rule.description)).size;

      const sortedAgents = Object.entries(agentCounts).sort(([, a], [, b]) => b - a);
      const topAgentsList = sortedAgents.slice(0, 5); // Get top 5

      const ruleCounts = alerts.reduce((acc, alert) => {
        const ruleDesc = alert.rule.description;
        acc[ruleDesc] = (acc[ruleDesc] || 0) + 1;
        return acc;
      }, {});

      const sortedRules = Object.entries(ruleCounts).sort(([, a], [, b]) => b - a);
      const topRulesList = sortedRules.slice(0, 5); // Get top 5

      const latestAlertsList = alerts.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf()).slice(0, 10); // Get latest 10 for feed

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
  }, [navigate]);

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

  const securityInfoCards = [
    { icon: ShieldAlert, title: "Security Events", description: "Visualize and analyze security alerts from your agents." },
    { icon: Sliders, title: "Integrity Monitoring", description: "Monitor file system changes for security and compliance." },
    { icon: FileText, title: "Log Analysis", description: "Collect, analyze, and store log data from various sources." },
    { icon: BookOpen, title: "Vulnerability Detection", description: "Identify system vulnerabilities and receive recommendations." },
  ];

  const auditingPolicyCards = [
    { icon: ListChecks, title: "Policy Monitoring", description: "Verify that your systems are configured according to security policies." },
    { icon: FileBarChart, title: "System Auditing", description: "Audit system activities and user behavior for suspicious actions." },
    { icon: ShieldCheck, title: "Security Configuration Assessment", description: "Assess the security configuration of your endpoints." },
  ];

  const threatDetectionCards = [
    { icon: ShieldAlert, title: "Vulnerabilities", description: "Detailed information on detected vulnerabilities." },
    { icon: ShieldHalf, title: "MITRE ATT&CK", description: "Map alerts to the MITRE ATT&CK framework for threat analysis." },
  ];

  const regulatoryComplianceCards = [
    { icon: Scale, title: "PCI DSS", description: "Monitor compliance with PCI DSS requirements." },
    { icon: Scale, title: "HIPAA", description: "Monitor compliance with HIPAA regulations." },
    { icon: Scale, title: "GDPR", description: "Monitor compliance with GDPR requirements." },
    { icon: Scale, title: "NIST 800-53", description: "Monitor compliance with NIST 800-53 controls." },
  ];


  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 relative">
          <h1 className="text-3xl font-bold text-primary mb-6">Security Operations Center</h1>

          {/* Main Content Grid */}
          <div className="p-4 md:p-8 pt-0">
            {/* Device Management */}
            <DeviceManagement />

            <h1 className="text-3xl font-bold mb-6 text-primary">Wazuh Security Dashboard</h1>

            {/* Agent Status Summary */}
            <AgentStatusSummary agentSummary={wazuhData.agentSummary} />

            {/* Charts and Top Lists Section */}
            <AlertsAndMetrics
              alertsOverTimeChartOptions={alertsOverTimeChartOptions}
              alertsOverTimeChartData={alertsOverTimeChartData}
              topAgents={alertSummary.topAgents}
              chartOptions={chartOptions}
              alertLevelChartData={alertLevelChartData}
              agentChartOptions={agentChartOptions}
              agentAlertChartData={agentAlertChartData}
              topRules={alertSummary.topRules}
            />

            {/* Security Information Cards */}
            <SecurityInfoCards />

            {/* Latest Alerts Feed */}
            <LatestAlerts latestAlerts={alertSummary.latestAlerts} />

<AlertSeverityBreakdown alerts={wazuhData.alerts} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SOC; 