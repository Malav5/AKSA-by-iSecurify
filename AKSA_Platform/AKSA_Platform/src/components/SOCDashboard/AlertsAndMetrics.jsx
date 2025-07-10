import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { fetchAgentAlertCounts, fetchAlertSeverityChartData, fetchAlertsOverTimeData } from '../../services/SOCservices';
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
        const [severityData, overTimeBuckets, agentBuckets] = await Promise.all([
          fetchAlertSeverityChartData(),
          fetchAlertsOverTimeData(),
          fetchAgentAlertCounts()
        ]);
  
        // 🔹 Handle Severity Chart Data
        const sortedSeverity = severityData.labels
          .map((label, i) => ({
            label,
            value: severityData.datasets[0].data[i]
          }))
          .sort((a, b) => {
            const aLevel = parseInt(a.label.replace(/\D/g, ''));
            const bLevel = parseInt(b.label.replace(/\D/g, ''));
            return aLevel - bLevel;
          });
  
        setAlertLevelChartData({
          labels: sortedSeverity.map(item => item.label),
          datasets: [
            {
              ...severityData.datasets[0],
              data: sortedSeverity.map(item => item.value)
            }
          ]
        });
  
        // 🔹 Handle Alerts Over Time Chart
        setAlertsOverTimeChartData({
          labels: overTimeBuckets.map(b => b.key_as_string),
          datasets: [
            {
              label: 'Alerts Over Time',
              data: overTimeBuckets.map(b => b.doc_count),
              fill: true,
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              tension: 0.3
            }
          ]
        });
  
        // 🔹 Handle Agent Alert Count Chart
        setAgentAlertCountData({
          labels: agentBuckets.map(b => b.key),
          datasets: [
            {
              label: 'Alerts per Agent',
              data: agentBuckets.map(b => b.doc_count),
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
