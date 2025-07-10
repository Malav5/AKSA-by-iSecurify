import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fetchAllAlerts } from '../../services/SOCservices';

ChartJS.register(ArcElement, Tooltip, Legend);

const colors = [
  '#2196f3', '#f87171', '#fbbf24', '#22c55e', '#a21caf', '#f59e42', '#6366f1', '#eab308', '#10b981', '#64748b'
];

const RuleCategoryChart = () => {
  const [topRules, setTopRules] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const getTopRules = async () => {
      const res = await fetchAllAlerts();
      const alerts = res?.hits?.hits || [];
      const ruleMap = {};
      alerts.forEach((alert) => {
        const desc = alert._source?.rule?.description || 'Unknown';
        ruleMap[desc] = (ruleMap[desc] || 0) + 1;
      });
      const sorted = Object.entries(ruleMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      setTopRules(sorted);
      setTotal(alerts.length);
    };
    getTopRules();
  }, []);

  const chartData = {
    labels: topRules.map(([desc]) => desc),
    datasets: [
      {
        data: topRules.map(([, count]) => count),
        backgroundColor: colors.slice(0, topRules.length),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { display: false } },
    cutout: '70%',
    animation: { animateScale: true, animateRotate: true },
  };

  const mostTriggered = topRules[0] || [null, 0];
  const mostTriggeredPct = total ? ((mostTriggered[1] / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-2xl shadow p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">Top Rule Categories</h2>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Donut chart */}
        <div className="w-full md:w-1/3 flex items-center justify-center">
          <div className="w-100 h-90">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
        {/* Stats and bars */}
        <div className="w-full md:w-2/3">
          <div className="text-xl mb-2 text-gray-600 font-medium">Total Rule Matches</div>
          <div className="text-8xl font-bold mb-4">{total.toLocaleString()}</div>
          {mostTriggered[0] && (
            <div className="mb-6">
              <div className="text-lg text-gray-600">Most Triggered Rule</div>
              <div className="text-blue-600 font-semibold text-2xl leading-tight">{mostTriggered[0]}</div>
              <div className="text-gray-500 text-xl">({mostTriggered[1].toLocaleString()} hits)</div>
            </div>
          )}
          {topRules.map(([desc, count], idx) => {
            const pct = total ? ((count / total) * 100).toFixed(1) : 0;
            return (
              <div key={desc} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700 text-xl font-medium">{desc}</span>
                  <span className="text-gray-500 text-sm">{count.toLocaleString()} alerts ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length] }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RuleCategoryChart;
