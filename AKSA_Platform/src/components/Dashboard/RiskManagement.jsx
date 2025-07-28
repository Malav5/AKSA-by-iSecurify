import React from "react";
import { useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { Link } from "react-router-dom";

const RiskManagement = ({ hideViewAll = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(undefined);

  const summary = {
    total: 25,
    low: 12,
    medium: 8,
    high: 5,
  };

  const pieData = [
    { title: "High", value: summary.high, color: "#EF4444" },
    { title: "Medium", value: summary.medium, color: "#F59E0B" },
    { title: "Low", value: summary.low, color: "#10B981" },
  ];

  return (
    <div className="bg-white p-4 md:p-6 lg:p-8 text-gray-800 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-orange-600 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Risk Manager</h2>
        </div>
        {!hideViewAll && (
          <Link
            to="/risk-manager"
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-5 py-2 rounded-xl font-medium text-sm md:text-base shadow-md hover:shadow-lg hover:from-red-700 hover:to-orange-700 transition-all"
          >
            View All Risks
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-100 rounded-full opacity-30" />
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Risk Status Summary</h3>

          <div className="w-32 h-32 md:w-40 md:h-40 relative group">
            <PieChart
              data={pieData}
              lineWidth={20}
              paddingAngle={3}
              animate
              segmentsStyle={{ 
                cursor: "pointer",
                transition: 'opacity 0.1s',
                opacity: hoveredIndex === undefined ? 1 : 0.7
              }}
              // Remove default labels
              label={() => null}
              labelPosition={0}
              // Highlight segment on hover
              segmentsShift={(index) => (index === hoveredIndex ? 2 : 0)}
              onMouseOver={(_, index) => setHoveredIndex(index)}
              onMouseOut={() => setHoveredIndex(undefined)}
            />
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
              <div className="text-2xl md:text-3xl font-bold">{summary.total}</div>
              <div className="text-xs md:text-sm">Total Risks</div>
            </div>

            {/* Enhanced Tooltip on Hover */}
            {hoveredIndex !== undefined && (
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                           bg-white text-gray-800 text-sm px-3 py-2 rounded-lg shadow-lg z-10 
                           border border-gray-200 min-w-[120px] text-center"
              >
                <div className="font-semibold">{pieData[hoveredIndex].title}</div>
                <div className="text-xs mt-1">
                  {pieData[hoveredIndex].value} risks ({Math.round(
                    (pieData[hoveredIndex].value / summary.total) * 100
                  )}%)
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-3 w-full text-sm md:text-base">
            {pieData.map(({ title, value, color }) => {
              const colorMap = {
                "High": {
                  bg: "bg-red-50",
                  border: "border-red-200",
                  text: "text-red-600",
                  dot: "bg-red-500"
                },
                "Medium": {
                  bg: "bg-amber-50",
                  border: "border-amber-200",
                  text: "text-amber-600",
                  dot: "bg-amber-500"
                },
                "Low": {
                  bg: "bg-emerald-50",
                  border: "border-emerald-200",
                  text: "text-emerald-600",
                  dot: "bg-emerald-500"
                }
              };
              
              const styles = colorMap[title] || {};
              
              return (
                <div
                  key={title}
                  className={`flex justify-between items-center rounded-lg px-3 py-2 border ${styles.bg} ${styles.border}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${styles.dot}`} />
                    <span>{title} Risk</span>
                  </div>
                  <span className={`font-semibold ${styles.text}`}>{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap with Labels Outside */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 lg:col-span-2 relative overflow-hidden px-20">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Risk Heatmap</h3>

          {/* Heatmap Area */}
          <div className="relative w-full h-72 border border-gray-300 rounded-xl overflow-hidden">
            {/* Heatmap Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500 via-yellow-400 to-green-500 opacity-30 z-0" />

            {/* Data Points */}
            <div title="Low Risk - 12 items"
              className="absolute top-[20%] left-[75%] w-10 h-10 flex items-center justify-center font-bold text-sm text-gray-800 bg-white border-2 border-gray-800 rounded-full shadow-md hover:scale-105 transition-all z-10">
              {summary.low}
            </div>
            <div title="Medium Risk - 8 items"
              className="absolute top-[45%] left-[45%] w-10 h-10 flex items-center justify-center font-bold text-sm text-gray-800 bg-white border-2 border-gray-800 rounded-full shadow-md hover:scale-105 transition-all z-10">
              {summary.medium}
            </div>
            <div title="High Risk - 5 items"
              className="absolute top-[70%] left-[15%] w-10 h-10 flex items-center justify-center font-bold text-sm text-gray-800 bg-white border-2 border-gray-800 rounded-full shadow-md hover:scale-105 transition-all z-10">
              {summary.high}
            </div>
          </div>

          {/* Likelihood (X-Axis) */}
          <div className="flex justify-between mt-2 text-xs font-semibold text-gray-600 px-2">
            <span>High</span>
            <span>Medium</span>
            <span>Low</span>
          </div>
          <div className="text-center mt-1 text-sm font-bold text-gray-800">
            Likelihood →
          </div>

          {/* Impact (Y-Axis) */}
          <div className="absolute left-[4%] top-[18%] text-xs font-semibold text-gray-600">Low</div>
          <div className="absolute left-[2%] top-[45%] text-xs font-semibold text-gray-600">Medium</div>
          <div className="absolute left-[4%]  bottom-[24%] text-xs font-semibold text-gray-600">High</div>
          <div className="absolute left-8 bottom-[35%] -translate-y-1/2 rotate-[-90deg] text-sm font-bold text-gray-800">
            Impact →
          </div>

          {/* Note */}
          <div className="mt-4 text-xs md:text-sm bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-orange-700 font-medium">
            🎯 Visual heatmap showcasing risk by impact vs. likelihood
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;