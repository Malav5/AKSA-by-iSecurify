import React from 'react';
import { Pie } from 'react-chartjs-2';

const AlertSeverityBreakdown = ({ alerts }) => {
  const levelBuckets = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  alerts.forEach(alert => {
    const level = alert.level;
    if (level <= 5) levelBuckets.Low++;
    else if (level <= 9) levelBuckets.Medium++;
    else if (level <= 12) levelBuckets.High++;
    else levelBuckets.Critical++;
  });

  const data = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: Object.values(levelBuckets),
        backgroundColor: ['#a3e635', '#facc15', '#fb923c', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Alert Severity Breakdown</h2>
      <div className="h-64">
        <Pie data={data} />
      </div>
    </div>
  );
};

export default AlertSeverityBreakdown;
