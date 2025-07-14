import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { fetchAllAlerts } from '../../services/SOCservices';

ChartJS.register(ArcElement, Tooltip, Legend);

const baseURL = 'http://localhost:3000';

const SeverityBreakdown = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      if (userRole === 'admin') {
        // Admin: show all alerts
        const allAlertsData = await fetchAllAlerts();
        const allAlerts = allAlertsData?.hits?.hits?.map(hit => hit._source) || [];
        setAlerts(allAlerts);
        setLoading(false);
        return;
      }
      // User: fetch assigned agent IDs
      const userEmail = localStorage.getItem('soc_email');
      if (!userEmail) {
        setAlerts([]);
        setLoading(false);
        return;
      }
      // Get assigned agents
      let assignedAgents = [];
      try {
        const assignedRes = await axios.get(`${baseURL}/api/agentMap/assigned-agents`, {
          params: { userEmail },
          headers: { Authorization: `Bearer ${token}` },
        });
        assignedAgents = assignedRes.data.agents || [];
      } catch (e) {
        setAlerts([]);
        setLoading(false);
        return;
      }
      const agentIds = assignedAgents.map(a => String(a.agentId).padStart(3, '0'));
      // Fetch all alerts, then filter for assigned agentIds
      const allAlertsData = await fetchAllAlerts();
      const allAlerts = allAlertsData?.hits?.hits?.map(hit => hit._source) || [];
      const filteredAlerts = allAlerts.filter(alert =>
        agentIds.includes(String(alert.agent?.id || alert.agentId).padStart(3, '0'))
      );
      setAlerts(filteredAlerts);
      setLoading(false);
    };
    loadAlerts();
  }, []);

  const severityConfig = {
    Critical: {
      threshold: 15,
      color: '#C4A1FF',
      darkColor: '#7e22ce',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-100',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    High: {
      threshold: 12,
      color: '#FF9E9E',
      darkColor: '#dc2626',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-100',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
        </svg>
      )
    },
    Medium: {
      threshold: 7,
      color: '#FFD6A5',
      darkColor: '#d97706',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-100',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    Low: {
      threshold: 0,
      color: '#A8E6CF',
      darkColor: '#16a34a',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-100',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  };

  const counts = {};
  Object.keys(severityConfig).forEach(level => counts[level] = 0);

  alerts.forEach(alert => {
    const level = alert.rule?.level ?? alert.level ?? 0;
    for (const [severity, config] of Object.entries(severityConfig)) {
      if (level >= config.threshold) {
        counts[severity]++;
        break;
      }
    }
  });

  const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
  const severityLevels = Object.keys(severityConfig);

  const chartData = {
    labels: severityLevels,
    datasets: [
      {
        data: severityLevels.map(level => counts[level]),
        backgroundColor: severityLevels.map(level => severityConfig[level].color),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 20,
        hoverBorderWidth: 4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.raw;
            const pct = total ? ((value / total) * 100).toFixed(1) : 0;
            return [`${label}: ${value} alerts`, `${pct}% of total`];
          },
        },
      },
    },
    cutout: '70%',
    animation: {
      animateScale: true,
      duration: 1500,
    },
    maintainAspectRatio: false,
    elements: {
      arc: { borderRadius: 8 }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
        <span className="ml-4 text-lg text-gray-600">Loading severity breakdown...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow p-8 mb-8 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Severity Distribution</h2>
          <p className="text-lg text-gray-500 mt-1">Breakdown of security alerts by severity level</p>
        </div>
        {total > 0 && (
          <div className="mt-4 md:mt-0 bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-base font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Total Alerts: <span className="font-bold ml-1">{total}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Severity Cards */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {severityLevels.map((level) => {
              const config = severityConfig[level];
              const count = counts[level];
              const percentage = total ? ((count / total) * 100).toFixed(1) : 0;

              return (
                <div key={level} className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-6 min-h-[200px] flex flex-col justify-between transition duration-300 hover:shadow-md`}>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <span className={`${config.textColor} mr-3`}>
                        {config.icon}
                      </span>
                      <h3 className={`${config.textColor} text-2xl font-bold`}>{level}</h3>
                    </div>
                    <span className={`${config.textColor} text-base font-semibold px-2 py-1 rounded-full ${config.bgColor}`}>
                      Level {config.threshold}+
                    </span>
                  </div>
                  <div className="flex justify-between items-end my-4">
                    <div>
                      <p className="text-4xl font-bold text-gray-900">{count}</p>
                      <p className="text-base text-gray-500">alerts detected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{percentage}<span className="text-lg text-gray-500 ml-1">%</span></p>
                      <p className="text-base text-gray-500">of total</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Visual Distribution</h3>
              <div className="flex items-center space-x-3">
                {severityLevels.map(level => (
                  <div key={level} className="flex items-center">
                    <span className="w-4 h-4 rounded-full mr-1.5" style={{ backgroundColor: severityConfig[level].color }}></span>
                    <span className="text-sm text-gray-600 font-medium">{level}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-grow relative">
              {total > 0 ? (
                <div className="w-full h-80 relative">
                  <Pie data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-700">{total}</p>
                      <p className="text-base text-gray-500">total alerts</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-3 text-base font-medium text-gray-500">No alert data available</h3>
                  <p className="mt-1 text-sm text-gray-400">Security alerts will appear here when detected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      {total > 0 && (
        <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Insights
          </h4>
          <ul className="text-base text-gray-600 space-y-3">
            {counts.Critical > 0 && (
              <li><strong className="text-purple-700">{counts.Critical}</strong> critical alerts – immediate action required</li>
            )}
            {counts.High > 0 && (
              <li><strong className="text-red-600">{counts.High}</strong> high-priority alerts – address within 24 hours</li>
            )}
            {counts.Medium > 0 && (
              <li><strong className="text-amber-600">{counts.Medium}</strong> medium alerts – review this week</li>
            )}
            {counts.Low > 0 && (
              <li><strong className="text-green-600">{counts.Low}</strong> low alerts – monitor periodically</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeverityBreakdown;
