import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';

ChartJS.register(ArcElement, Tooltip, Legend);

const SeverityBreakdown = ({ alerts = [] }) => {
  // Severity level configuration
  const severityConfig = {
    Critical: {
      threshold: 15,
      color: '#7e22ce',  // purple-700
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    High: {
      threshold: 12,
      color: '#dc2626',   // red-600
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
        </svg>
      )
    },
    Medium: {
      threshold: 7,
      color: '#d97706',   // amber-600
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    Low: {
      threshold: 0,
      color: '#16a34a',   // green-600
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  };

  // Aggregate counts from alerts
  const counts = {};
  Object.keys(severityConfig).forEach(level => {
    counts[level] = 0;
  });

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

  // Chart data
  const chartData = {
    labels: severityLevels,
    datasets: [
      {
        data: severityLevels.map(level => counts[level]),
        backgroundColor: severityLevels.map(level => severityConfig[level].color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: { 
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.raw;
            const pct = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} alerts (${pct}%)`;
          },
        },
      },
    },
    cutout: '75%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500,
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Severity Distribution</h2>
          <p className="text-gray-500 mt-1">Breakdown of alerts by severity level</p>
        </div>
        {total > 0 && (
          <div className="mt-3 md:mt-0 bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            Total Alerts: <span className="font-bold">{total}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Severity Cards */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {severityLevels.map((level) => {
              const config = severityConfig[level];
              const count = counts[level];
              const percentage = total ? ((count / total) * 100).toFixed(1) : 0;
              
              return (
                <div 
                  key={level}
                  className={`${config.bgColor} ${config.borderColor} border rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:transform hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className={`${config.textColor} mr-2`}>
                        {config.icon}
                      </span>
                      <h3 className={`${config.textColor} font-semibold`}>{level}</h3>
                    </div>
                    <span className={`${config.textColor} text-xs font-medium px-2 py-1 rounded-full ${config.bgColor}`}>
                      Threshold: {config.threshold}+
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{count}</p>
                      <p className="text-gray-500">alerts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
                      <p className="text-gray-500">of total</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Visual Distribution</h3>
              <div className="flex items-center space-x-2">
                {severityLevels.map(level => (
                  <div key={level} className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: severityConfig[level].color }}
                    ></span>
                    <span className="text-xs text-gray-600">{level}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-grow flex items-center justify-center">
              {total > 0 ? (
                <div className="w-full h-64 md:h-80">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No alert data</h3>
                  <p className="mt-1 text-sm text-gray-500">There are currently no alerts to display.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      {total > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Takeaways</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {counts.Critical > 0 && (
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong className="font-medium">{counts.Critical} Critical</strong> alerts require immediate attention</span>
              </li>
            )}
            {counts.High > 0 && (
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong className="font-medium">{counts.High} High</strong> priority alerts should be addressed soon</span>
              </li>
            )}
            <li className="flex items-start">
              <span className="text-gray-600 mr-2">•</span>
              <span>Severity is calculated based on rule level thresholds</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

SeverityBreakdown.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      rule: PropTypes.shape({
        level: PropTypes.number,
      }),
      level: PropTypes.number,
    })
  ),
};

export default SeverityBreakdown;