import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fetchAllAlerts, fetchAssignedAgents } from '../../services/SOCservices';
import PropTypes from 'prop-types';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const RuleCategoryChart = ({ maxCategories = 8 }) => {
  const [topRules, setTopRules] = useState([]);
  const [total, setTotal] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = [
    '#3B82F6', '#EF4444', '#F59E0B', '#10B981',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
    '#6366F1', '#D946EF'
  ];

  useEffect(() => {
    const getTopRules = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        let allAlerts = [];
        if (userRole === 'admin') {
          // Admin: use all alerts
          const res = await fetchAllAlerts();
          allAlerts = res?.hits?.hits || [];
        } else {
          // User: fetch assigned agent IDs
          const userEmail = localStorage.getItem('soc_email');
          if (!userEmail) {
            setError('No user email found.');
            setLoading(false);
            return;
          }
          // Get assigned agents
          let assignedAgents = [];
          try {
            assignedAgents = await fetchAssignedAgents(userEmail, token);
          } catch (e) {
            setError('Failed to fetch assigned agents.');
            setLoading(false);
            return;
          }
          const agentIds = assignedAgents.map(a => String(a.agentId).padStart(3, '0'));
          // Fetch all alerts, then filter for assigned agentIds
          const res = await fetchAllAlerts();
          const fetchedAlerts = res?.hits?.hits || [];
          allAlerts = fetchedAlerts.filter(alert =>
            agentIds.includes(String(alert._source?.agent?.id || alert._source?.agentId).padStart(3, '0'))
          );
        }
        setAlerts(allAlerts);

        const ruleMap = {};
        allAlerts.forEach((alert) => {
          const desc = alert._source?.rule?.description || 'Unknown Rule';
          ruleMap[desc] = (ruleMap[desc] || 0) + 1;
        });

        const sorted = Object.entries(ruleMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, maxCategories);

        setTopRules(sorted);
        setTotal(allAlerts.length);
      } catch (err) {
        setError('Failed to load rule category data');
      } finally {
        setLoading(false);
      }
    };

    getTopRules();
  }, [maxCategories]);

  const handleCardClick = (desc) => {
    setSelectedRule(desc);
    const matchedAlerts = alerts.filter(
      (alert) => alert._source?.rule?.description === desc
    );
    setFilteredAlerts(matchedAlerts);
  };

  const clearSelection = () => {
    setSelectedRule(null);
    setFilteredAlerts([]);
  };

  const chartData = {
    labels: topRules.map(([desc]) => desc),
    datasets: [{
      data: topRules.map(([, count]) => count),
      backgroundColor: colors.slice(0, topRules.length),
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 15,
      hoverBorderWidth: 3
    }]
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw || 0;
            const pct = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${ctx.label}: ${value} (${pct}%)`;
          }
        }
      },
    },
    cutout: '75%',
    maintainAspectRatio: false
  };

  const mostTriggered = topRules[0] || [null, 0];
  const mostTriggeredPct = total ? ((mostTriggered[1] / total) * 100).toFixed(1) : 0;

  if (loading) return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 flex justify-center items-center h-64">
      <div className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full"></div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 text-red-600 text-center h-64 flex items-center justify-center">
      {error}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Rule Category Analysis</h2>
          <p className="text-gray-500">Visual and card breakdown of rule-based alerts</p>
        </div>
        <div className="bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium">
          Total Alerts: <span className="font-semibold">{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 rounded-xl p-6 h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-64">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-700">{total.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">Total Alerts</p>
                </div>
              </div>
            </div>
            {mostTriggered[0] && (
              <div className="mt-4 text-sm text-center text-blue-700">
                <div className="font-semibold">Most Frequent:</div>
                <div>{mostTriggered[0]} ({mostTriggeredPct}%)</div>
              </div>
            )}
          </div>
        </div>

        {/* Rule Cards */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-5">
          {topRules.map(([desc, count], i) => {
            const pct = total ? ((count / total) * 100).toFixed(1) : 0;
            return (
              <div
                key={desc}
                className="bg-gray-50 cursor-pointer rounded-xl p-4 border border-gray-200 hover:shadow transition"
                onClick={() => handleCardClick(desc)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-gray-700 font-semibold text-lg truncate pr-2">{desc}</div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{pct}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Alerts: <span className="text-gray-800 font-bold">{count}</span>
                  </span>
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors[i % colors.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtered Alerts */}
      {selectedRule && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Alerts for: <span className="text-blue-600">{selectedRule}</span>
            </h3>
            <button
              onClick={clearSelection}
              className="text-sm text-blue-500 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-md divide-y max-h-72 overflow-y-auto">
            {filteredAlerts.map((alert, idx) => (
              <div key={idx} className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                <span className="font-medium">Agent:</span> {alert._source?.agent?.name || 'Unknown'}<br />
                <span className="font-medium">Message:</span> {alert._source?.rule?.description}<br />
                <span className="text-xs text-gray-500">{alert._source?.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

RuleCategoryChart.propTypes = {
  maxCategories: PropTypes.number
};

export default RuleCategoryChart;
