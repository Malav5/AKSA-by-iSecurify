import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const bucketSeverity = (level) => {
  if (level >= 15) return 'Critical';
  if (level >= 12) return 'High';
  if (level >= 7)  return 'Medium';
  return 'Low';
};

const SeverityBreakdown = ({ alerts = [] }) => {
  // Aggregate counts from alerts
  const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  alerts.forEach(alert => {
    const level = alert.rule?.level ?? alert.level ?? 0;
    const bucket = bucketSeverity(level);
    counts[bucket]++;
  });
  const total = Object.values(counts).reduce((sum, val) => sum + val, 0);

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const colors = {
    Low: '#22c55e',      // green
    Medium: '#f59e1b',   // orange
    High: '#ef4444',     // red
    Critical: '#a21caf', // purple
  };

  const data = severityLevels.map((label) => counts[label]);

  const chartData = {
    labels: severityLevels,
    datasets: [
      {
        data,
        backgroundColor: severityLevels.map((label) => colors[label]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
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
    cutout: '70%',
    animation: { animateScale: true, animateRotate: true },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">Severity Breakdown</h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Left: 2x2 grid of cards */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4">
            {severityLevels.map((level) => {
              const count = counts[level];
              const percentage = total ? ((count / total) * 100).toFixed(1) : 0;
              const dotColor = colors[level];
              return (
                <div key={level} className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-start justify-center min-w-[180px] min-h-[110px] transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dotColor }}></span>
                    <span className="text-lg font-bold text-gray-700">{level}</span>
                  </div>
                  <div className="text-7xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-gray-500 text-xl">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right: Donut chart */}
        <div className="bg-white shadow-lg rounded-xl p-6 flex items-center min-w-[180px] min-h-[110px] w-full md:w-1/2 flex items-center justify-center transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <div className="w-100 h-90">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-600 text-base">
        Severity levels help prioritize security responses. Focus on Critical and High severity alerts first.
      </div>
    </div>
  );
};

export default SeverityBreakdown;