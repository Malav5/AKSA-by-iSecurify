import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { fetchAgentAlertCounts, fetchAlertSeverityChartData, fetchAlertsOverTimeData, fetchAllAlerts, fetchAssignedAgents, fetchVulnerabilities } from '../../services/SOCservices';
import axios from 'axios';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler, // ✅ Required for "fill"
} from 'chart.js';

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler // ✅ Register Filler here
);

const baseURL = 'http://localhost:3000';

const AlertsAndMetrics = ({
  topAgents,
  agentChartOptions,
  agentAlertChartData,
  topRules
}) => {
  const [alertLevelChartData, setAlertLevelChartData] = useState({ labels: [], datasets: [] });
  const [agentAlertCountData, setAgentAlertCountData] = useState({ labels: [], datasets: [] });
  const [alertsOverTimeChartData, setAlertsOverTimeChartData] = useState({
    labels: [],
    datasets: []
  });
  const [topVulnRules, setTopVulnRules] = useState([]);
  const [topDangerRules, setTopDangerRules] = useState([]);
  const [loading, setLoading] = useState(true);


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Alerts by Severity Level' }
    }
  };

  const agentCountChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Alerts per Agent' }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10 // limits the number of ticks to keep it readable
        }
      }
    }
  };

  const alertsOverTimeChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Alerts Over Time'
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };



  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        let filteredAlerts = [];
        let filteredVulns = [];
        let agentIds = [];
        if (userRole === 'admin') {
          // Admin: show all alerts and all vulnerabilities
          const allAlertsData = await fetchAllAlerts();
          filteredAlerts = allAlertsData.hits?.hits?.map(hit => hit._source) || [];
          filteredVulns = await fetchVulnerabilities();
        } else {
          // User: fetch assigned agent IDs
          const userEmail = localStorage.getItem('soc_email');
          if (!userEmail) {
            setAlertLevelChartData({ labels: [], datasets: [] });
            setAgentAlertCountData({ labels: [], datasets: [] });
            setAlertsOverTimeChartData({ labels: [], datasets: [] });
            setTopVulnRules([]);
            return;
          }
          // Get assigned agents
          const assignedAgents = await fetchAssignedAgents(userEmail, token);
          agentIds = assignedAgents.map(a => String(a.agentId).padStart(3, '0'));
          // Fetch all alerts, then filter for assigned agentIds
          const allAlertsData = await fetchAllAlerts();
          filteredAlerts = (allAlertsData.hits?.hits?.map(hit => hit._source) || []).filter(alert =>
            agentIds.includes(String(alert.agent?.id || alert.agentId).padStart(3, '0'))
          );
          // Fetch all vulnerabilities, then filter for assigned agentIds
          const allVulns = await fetchVulnerabilities();
          filteredVulns = allVulns.filter(vuln => {
            // Try to match agent id or agent name in vuln._source or vuln fields
            const agentId = String(vuln._source?.agent?.id || vuln._source?.agentId || vuln.agentId || vuln.agent?.id || '').padStart(3, '0');
            return agentIds.includes(agentId);
          });
        }

        // Build Severity Chart Data
        const severityCounts = {};
        filteredAlerts.forEach(alert => {
          const level = alert.rule?.level || 0;
          const label = `Level ${level}`;
          severityCounts[label] = (severityCounts[label] || 0) + 1;
        });
        const sortedSeverity = Object.entries(severityCounts)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => parseInt(a.label.replace(/\D/g, '')) - parseInt(b.label.replace(/\D/g, '')));
        setAlertLevelChartData({
          labels: sortedSeverity.map(item => item.label),
          datasets: [
            {
              label: 'Alerts',
              data: sortedSeverity.map(item => item.value),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        });

        // Build Alerts Over Time Chart Data
        const timeCounts = {};
        filteredAlerts.forEach(alert => {
          const date = alert['@timestamp'] ? alert['@timestamp'].slice(0, 10) : (alert.timestamp ? alert.timestamp.slice(0, 10) : '');
          if (date) timeCounts[date] = (timeCounts[date] || 0) + 1;
        });

        // Generate last 10 days (including today)
        const today = new Date();
        const last10Days = [];
        for (let i = 9; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          last10Days.push(d.toISOString().slice(0, 10));
        }
        setAlertsOverTimeChartData({
          labels: last10Days,
          datasets: [
            {
              label: 'Alerts Over Time',
              data: last10Days.map(date => timeCounts[date] || 0),
              fill: true,
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              tension: 0.3
            }
          ]
        });

        // Build Agent Alert Count Chart Data
        const agentCounts = {};
        filteredAlerts.forEach(alert => {
          const agentName = alert.agent?.name || alert.agentName || 'Unknown';
          agentCounts[agentName] = (agentCounts[agentName] || 0) + 1;
        });
        const agentNames = Object.keys(agentCounts);
        setAgentAlertCountData({
          labels: agentNames,
          datasets: [
            {
              label: 'Alerts per Agent',
              data: agentNames.map(name => agentCounts[name]),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        });

        // Build Top Vulnerability Rules (by vuln title or rule name)
        const vulnRuleCounts = {};
        filteredVulns.forEach(vuln => {
          const rule =
            vuln._source?.vulnerability?.name ||
            vuln._source?.rule?.name ||
            vuln._source?.title ||
            vuln._source?.name ||
            vuln.vulnerability?.name ||
            vuln.rule?.name ||
            vuln.title ||
            vuln.name ||
            'Unknown';
          if (rule === 'Unknown') {
            console.log('Unknown rule for vuln:', vuln);
          }
          vulnRuleCounts[rule] = (vulnRuleCounts[rule] || 0) + 1;
        });
        const sortedVulnRules = Object.entries(vulnRuleCounts)
          .map(([rule, count]) => [rule, count])
          .sort((a, b) => b[1] - a[1]);
        setTopVulnRules(sortedVulnRules);

        // Build Top Dangerous Alert Rules (by highest severity/level)
        const ruleSeverityMap = {};
        filteredAlerts.forEach(alert => {
          const ruleName = alert.rule?.description || alert.rule?.name || alert.title || 'Unknown';
          const level = alert.rule?.level || 0;
          if (!ruleSeverityMap[ruleName]) {
            ruleSeverityMap[ruleName] = { count: 0, maxLevel: 0 };
          }
          ruleSeverityMap[ruleName].count += 1;
          if (level > ruleSeverityMap[ruleName].maxLevel) {
            ruleSeverityMap[ruleName].maxLevel = level;
          }
        });
        // Sort by maxLevel (desc), then by count (desc)
        const sortedDangerRules = Object.entries(ruleSeverityMap)
          .map(([rule, data]) => ({ rule, ...data }))
          .sort((a, b) => b.maxLevel - a.maxLevel || b.count - a.count);
        setTopDangerRules(sortedDangerRules.slice(0, 3));
      } catch (error) {
        console.error("❌ Error loading dashboard chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Loader component
  const ChartLoader = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mb-4"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  );


  return (
    <>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4 ">Alerts by Severity Level</h3>
          <div className="h-100 min-h-[256px]">
            {loading ? <ChartLoader /> : <Bar options={chartOptions} data={alertLevelChartData} />}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4 ">Alerts per Agent</h3>
          <div className="h-100 min-h-[256px]">
            {loading ? <ChartLoader /> : <Bar options={agentCountChartOptions} data={agentAlertCountData} />}
          </div>
        </div>
      </div>

      {/* Alerts Over Time and Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4 ">Alerts Over Time</h3>
          <div className="h-100 min-h-[256px]">
            {loading ? <ChartLoader /> : <Line options={alertsOverTimeChartOptions} data={alertsOverTimeChartData} />}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[350px] flex flex-col shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4">Top Dangerous Alert Rules</h3>
          <div className="flex-1 min-h-[256px]">
            {loading ? (
              <ChartLoader />
            ) : topDangerRules && topDangerRules.length > 0 ? (
              <div className="space-y-4">
                {topDangerRules.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-orange-500 text-xl">&#9888;&#65039;</span>
                      <span className="text-base font-medium text-gray-900">{item.rule}</span>
                    </div>
                    <span className="bg-red-200 text-red-700 rounded-full px-3 py-1 text-base font-semibold min-w-[32px] text-center">
                      Max Severity: {item.maxLevel} | Count: {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No dangerous alert rules found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertsAndMetrics;
