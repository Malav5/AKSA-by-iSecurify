import React from 'react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

const VulnerabilitiesChart = ({ severityChart, packageChart, agentChart }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Severity Distribution</h3>
        <Bar data={severityChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Top Packages Affected</h3>
        <Doughnut data={packageChart} />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Top Affected Agents</h3>
        <Pie data={agentChart} />
      </div>
    </div>
  );
};

export default VulnerabilitiesChart; 