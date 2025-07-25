import React from "react";
import { PieChart } from "react-minimal-pie-chart";
import { Link } from "react-router-dom";

const RiskManagement = ({ hideViewAll = false }) => {
  const summary = {
    total: 25,
    low: 12,
    medium: 8,
    high: 5,
  };

  return (
    <div className="bg-white p-3 md:p-4 lg:p-6 rounded-xl text-gray-800 space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-semibold">Risk Manager</h2>
        {!hideViewAll && (
          <Link to="/risk-manager" className="text-primary underline text-sm md:text-base">
            View all
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Donut Chart */}
        <div className="bg-white shadow-sm rounded-lg p-4 md:p-6 flex flex-col items-center lg:col-span-1">
          <h3 className="mb-3 md:mb-4 font-semibold text-base md:text-lg">Risk Statement Status</h3>

          <div className="w-28 h-28 md:w-36 md:h-36 relative">
            <PieChart
              data={[
                { title: "High", value: 5, color: "#EF4444" },
                { title: "Medium", value: 8, color: "#FACC15" },
                { title: "Low", value: 12, color: "#10B981" },
              ]}
              lineWidth={16}
              paddingAngle={2}
              label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
              labelStyle={{
                fontSize: "5px",
                fontWeight: 600,
                fill: "#374151",
              }}
              labelPosition={70}
              animate
              segmentsStyle={{ cursor: "pointer" }}
              segmentsShift={(index) => (index === 0 ? 2 : 0)}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
              <div className="text-lg md:text-xl font-bold">25</div>
              <div className="text-xs">Total</div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 md:mt-6 text-xs md:text-sm space-y-1 text-gray-700">
            <p><span className="text-red-500">●</span> 5 High</p>
            <p><span className="text-yellow-400">●</span> 8 Medium</p>
            <p><span className="text-green-500">●</span> 12 Low</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white shadow-sm rounded-lg p-4 md:p-6 lg:col-span-2 relative">
          <h3 className="mb-2 font-semibold text-base md:text-lg">Risk Manager</h3>
          <div className="relative w-full h-48 md:h-64 rounded overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(135deg, #EF4444, #FACC15, #10B981)",
              }}
            />

            {/* Static data points (example positioning) */}
            <div
              className="absolute top-[20%] left-[75%] bg-white text-gray-800 text-xs font-bold border-2 border-gray-800 rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shadow"
              title="Low Risk"
            >
              12
            </div>
            <div
              className="absolute top-[45%] left-[45%] bg-white text-gray-800 text-xs font-bold border-2 border-gray-800 rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shadow"
              title="Medium Risk"
            >
              8
            </div>
            <div
              className="absolute top-[70%] left-[15%] bg-white text-gray-800 text-xs font-bold border-2 border-gray-800 rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shadow"
              title="High Risk"
            >
              5
            </div>

            {/* Axis Labels */}
            <div className="absolute left-[-30px] md:left-[-40px] top-[45%] rotate-[-90deg] text-xs md:text-sm font-semibold text-gray-700">
              Impact →
            </div>
            <div className="absolute bottom-[-20px] md:bottom-[-24px] left-[45%] text-xs md:text-sm font-semibold text-gray-700">
              Likelihood →
            </div>

            {/* Y-Axis Ticks */}
            <div className="absolute left-[-25px] md:left-[-35px] top-[5%] text-xs text-gray-500">Low</div>
            <div className="absolute left-[-35px] md:left-[-45px] top-[40%] text-xs text-gray-500">Medium</div>
            <div className="absolute left-[-25px] md:left-[-35px] bottom-0 text-xs text-gray-500">High</div>

            {/* X-Axis Ticks */}
            <div className="absolute bottom-[-16px] md:bottom-[-20px] left-0 text-xs text-gray-500">High</div>
            <div className="absolute bottom-[-16px] md:bottom-[-20px] left-[45%] text-xs text-gray-500">Medium</div>
            <div className="absolute bottom-[-16px] md:bottom-[-20px] right-0 text-xs text-gray-500">Low</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;
