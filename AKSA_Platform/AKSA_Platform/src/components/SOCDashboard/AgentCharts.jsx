import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  'rgba(52, 211, 153, 0.6)',  // Teal (green)
  'rgba(248, 113, 113, 0.6)', // Red
  'rgba(251, 191, 36, 0.6)',  // Yellow
  'rgba(96, 165, 250, 0.6)',  // Blue
  'rgba(167, 139, 250, 0.6)', // Purple
  'rgba(244, 114, 182, 0.6)', // Pink
];


const AgentCharts = ({ agents }) => {
  const statusCounts = {};
  const osCounts = {};
  const groupCounts = {};

  agents.forEach(agent => {
    // Status Count
    statusCounts[agent.status] = (statusCounts[agent.status] || 0) + 1;

    // OS Count
    const osString = agent.os?.name?.toLowerCase?.() || 'unknown';
    const osName = osString.includes('windows')
      ? 'Windows'
      : osString.includes('mac')
      ? 'macOS'
      : osString.includes('linux')
      ? 'Linux'
      : 'Other';
    osCounts[osName] = (osCounts[osName] || 0) + 1;

    // Group Count
    const group = agent.group || 'default';
    groupCounts[group] = (groupCounts[group] || 0) + 1;
  });

  const formatChartData = (obj) => {
    const entries = Object.entries(obj).slice(0, 5); // Top 5
    return {
      labels: entries.map(([key]) => key),
      datasets: [
        {
          data: entries.map(([, value]) => value),
          backgroundColor: COLORS,
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-4">
      <ChartCard title="Agents by Status" chartData={formatChartData(statusCounts)} />
      <ChartCard title="Top 5 Operating Systems" chartData={formatChartData(osCounts)} />
      <ChartCard title="Top 5 Agent Groups" chartData={formatChartData(groupCounts)} />
    </div>
  );
};

const ChartCard = ({ title, chartData }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
    <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="w-full h-64 flex items-center justify-center">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#374151',
                boxWidth: 14,
                padding: 20,
              },
            },
            tooltip: {
              backgroundColor: '#f9fafb',
              titleColor: '#111827',
              bodyColor: '#4b5563',
              borderColor: '#d1d5db',
              borderWidth: 1,
            },
          },
        }}
      />
    </div>
  </div>
);

export default AgentCharts;
