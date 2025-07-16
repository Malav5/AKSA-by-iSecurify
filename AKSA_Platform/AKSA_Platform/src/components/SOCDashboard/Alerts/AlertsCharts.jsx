import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { List, Info } from 'lucide-react';

const AlertsCharts = ({ chartData, doughnutData, chartOptions, doughnutOptions, loading, filteredAlerts }) => {
  // Check if all chart data is zero
  const allZero = chartData.datasets[0].data.every(v => v === 0);
  // For doughnut, check if all are zero
  const allDoughnutZero = doughnutData.datasets[0].data.every(v => v === 0);

  // Optionally, check for specific alert types
  const alertTypes = ['Critical', 'High', 'Medium', 'Low'];
  const zeroTypes = chartData.datasets[0].data
    .map((v, i) => (v === 0 ? alertTypes[i] : null))
    .filter(Boolean);

  return (
    <div className="relative">
      {/* Loader overlay for the whole chart section */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
          <div className="animate-spin rounded-full h-16 w-16 border-8 border-primary border-t-transparent"></div>
        </div>
      )}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-opacity ${loading ? 'opacity-30 pointer-events-none' : ''}`}>
        {/* Alert Distribution by Severity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <List size={18} className="text-primary" />
            Alert Distribution by Severity
          </h3>
          <div className="h-64 flex items-center justify-center w-full">
            {allZero ? (
              <div className="text-gray-400 text-center w-full">No alerts to display</div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
          {/* Show which types are zero, if any */}
          {zeroTypes.length > 0 && zeroTypes.length < alertTypes.length && (
            <div className="mt-2 text-xs text-gray-400 text-center w-full">
              {zeroTypes.map(type => (
                <div key={type}>No {type.toLowerCase()} alerts</div>
              ))}
            </div>
          )}
        </div>
        {/* Alert Severity Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info size={18} className="text-primary" />
            Alert Severity Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center w-full">
            {allDoughnutZero ? (
              <div className="text-gray-400 text-center w-full">No alerts to display</div>
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsCharts; 