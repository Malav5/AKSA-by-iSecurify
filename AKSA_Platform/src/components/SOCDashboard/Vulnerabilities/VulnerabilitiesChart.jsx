import React from 'react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

const doughnutPieAnimation = {
  animateRotate: true,
  animateScale: true,
  duration: 1200,
  easing: 'easeOutQuart',
};

const doughnutPieOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'right', labels: { font: { size: 12 } } },
    tooltip: { enabled: true },
  },
  cutout: '70%',
  borderWidth: 3,
  borderColor: '#fff',
  animation: doughnutPieAnimation,
  hoverOffset: 16,
  hoverBorderWidth: 4,
  layout: { padding: 10 },
};

const chartHeight = '20rem'; // h-80

const ChartFlex = ({ children }) => (
  <div className="flex items-center justify-center w-full" style={{ height: chartHeight, minHeight: chartHeight }}>
    {children}
  </div>
);

const VulnerabilitiesChart = ({ severityChart, packageChart, agentChart }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Severity Distribution</h3>
        <ChartFlex>
          <Bar data={severityChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </ChartFlex>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Top Packages Affected</h3>
        <ChartFlex>
          <Doughnut data={packageChart} options={doughnutPieOptions} />
        </ChartFlex>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Top Affected Agents</h3>
        <ChartFlex>
          <Pie data={agentChart} options={doughnutPieOptions} />
        </ChartFlex>
      </div>
    </div>
  );
};

export default VulnerabilitiesChart; 