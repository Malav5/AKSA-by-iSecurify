import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { fetchAgentAlertCounts, fetchAlertSeverityChartData, fetchAlertsOverTimeData, fetchAllAlerts } from '../../services/SOCservices';
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
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        let filteredAlerts = [];
        if (userRole === 'admin') {
          // Admin: show all alerts
          const allAlertsData = await fetchAllAlerts();
          filteredAlerts = allAlertsData.hits?.hits?.map(hit => hit._source) || [];
        } else {
          // User: fetch assigned agent IDs
          const userEmail = localStorage.getItem('soc_email');
          if (!userEmail) {
            setAlertLevelChartData({ labels: [], datasets: [] });
            setAgentAlertCountData({ labels: [], datasets: [] });
            setAlertsOverTimeChartData({ labels: [], datasets: [] });
            return;
          }
          // Get assigned agents
          const assignedRes = await axios.get(`${baseURL}/api/agentMap/assigned-agents`, {
            params: { userEmail },
            headers: { Authorization: `Bearer ${token}` },
          });
          const assignedAgents = assignedRes.data.agents || [];
          const agentIds = assignedAgents.map(a => String(a.agentId).padStart(3, '0'));
          // Fetch all alerts, then filter for assigned agentIds
          const allAlertsData = await fetchAllAlerts();
          filteredAlerts = (allAlertsData.hits?.hits?.map(hit => hit._source) || []).filter(alert =>
            agentIds.includes(String(alert.agent?.id || alert.agentId).padStart(3, '0'))
          );
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
        let sortedDates = Object.keys(timeCounts).sort();
        if (sortedDates.length > 10) {
          sortedDates = sortedDates.slice(-10);
        }
        setAlertsOverTimeChartData({
          labels: sortedDates,
          datasets: [
            {
              label: 'Alerts Over Time',
              data: sortedDates.map(date => timeCounts[date]),
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
      } catch (error) {
        console.error("❌ Error loading dashboard chart data:", error);
      }
    };
    loadData();
  }, []);


  return (
    <>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4 ">Alerts by Severity Level</h3>
          <div className="h-100">
            <Bar options={chartOptions} data={alertLevelChartData} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4 ">Alerts per Agent</h3>
          <div className="h-100">
            <Bar options={agentCountChartOptions} data={agentAlertCountData} />
          </div>
        </div>
      </div>

      {/* Alerts Over Time and Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4 ">Alerts Over Time</h3>
          <div className="h-100">
            <Line options={alertsOverTimeChartOptions} data={alertsOverTimeChartData} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[350px] flex flex-col shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <h3 className="text-2xl font-bold mb-4">Top Alert Rules</h3>
          {topRules && topRules.length > 0 ? (
            <div className="space-y-4">
              {topRules.slice(0, 3).map(([rule, count], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500 text-xl">&#9888;&#65039;</span>
                    <span className="text-base font-medium text-gray-900">{rule}</span>
                  </div>
                  <span className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-base font-semibold min-w-[32px] text-center">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No rule data available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AlertsAndMetrics;
