import React from "react";
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment';

const AlertsAndMetrics = ({
  alertsOverTimeChartOptions,
  alertsOverTimeChartData,
  topAgents,
  chartOptions,
  alertLevelChartData,
  agentChartOptions,
  agentAlertChartData,
  topRules,
}) => {
  return (
    <>
      {/* Charts and Top Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 h-80 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-primary">Alerts Over Time</h3>
          <div className="flex-grow">
            <Line options={alertsOverTimeChartOptions} data={alertsOverTimeChartData} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-primary">Top Agents by Alerts</h3>
          {topAgents.length > 0 ? (
            <ul>
              {topAgents.map(([agent, count], index) => (
                <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="text-gray-700">{agent}</span>
                  <span className="font-semibold text-primary">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No agent data available.</p>
          )}
        </div>
      </div>

      {/* Additional Charts and Top Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 h-80 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-primary">Alerts by Severity Level</h3>
          <div className="flex-grow">
            <Bar options={chartOptions} data={alertLevelChartData} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 h-80 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-primary">Alerts per Agent</h3>
          <div className="flex-grow">
            <Bar options={agentChartOptions} data={agentAlertChartData} />
          </div>
        </div>
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-primary">Top Alert Rules</h3>
          {topRules.length > 0 ? (
            <ul>
              {topRules.map(([rule, count], index) => (
                <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="text-gray-700 text-sm">{rule}</span>
                  <span className="font-semibold text-primary">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No rule data available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AlertsAndMetrics; 