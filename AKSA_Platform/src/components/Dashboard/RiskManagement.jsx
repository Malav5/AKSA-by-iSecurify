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
    <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl text-gray-800 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 bg-gradient-to-b from-red-500 to-orange-600 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Risk Manager</h2>
        </div>
        {!hideViewAll && (
          <Link 
            to="/risk-manager" 
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-red-700 hover:to-orange-700"
          >
            View All Risks
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Donut Chart */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 flex flex-col items-center lg:col-span-1 border border-gray-100 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-transparent rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <h3 className="font-bold text-lg md:text-xl text-gray-800">Risk Statement Status</h3>
          </div>

          <div className="w-32 h-32 md:w-40 md:h-40 relative">
            <PieChart
              data={[
                { title: "High", value: 5, color: "#EF4444" },
                { title: "Medium", value: 8, color: "#F59E0B" },
                { title: "Low", value: 12, color: "#10B981" },
              ]}
              lineWidth={20}
              paddingAngle={3}
              label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
              labelStyle={{
                fontSize: "8px",
                fontWeight: 600,
                fill: "#374151",
              }}
              labelPosition={75}
              animate
              segmentsStyle={{ cursor: "pointer" }}
              segmentsShift={(index) => (index === 0 ? 3 : 0)}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
              <div className="text-2xl md:text-3xl font-bold text-gray-800">{summary.total}</div>
              <div className="text-sm font-medium text-gray-600">Total Risks</div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-3 text-sm md:text-base">
            <div className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">High Risk</span>
              </div>
              <span className="text-red-600 font-bold">{summary.high}</span>
            </div>
            <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="font-medium">Medium Risk</span>
              </div>
              <span className="text-amber-600 font-bold">{summary.medium}</span>
            </div>
            <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="font-medium">Low Risk</span>
              </div>
              <span className="text-emerald-600 font-bold">{summary.low}</span>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 lg:col-span-2 relative overflow-hidden border border-gray-100">
          {/* Background decoration */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-100 to-transparent rounded-full translate-y-16 -translate-x-16 opacity-50"></div>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
            <h3 className="font-bold text-lg md:text-xl text-gray-800">Risk Heatmap</h3>
          </div>
          
          <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(135deg, #EF4444, #F59E0B, #10B981)",
              }}
            />

            {/* Static data points with enhanced styling */}
            <div
              className="absolute top-[20%] left-[75%] bg-white text-gray-800 text-xs md:text-sm font-bold border-2 border-gray-800 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
              title="Low Risk - 12 items"
            >
              12
            </div>
            <div
              className="absolute top-[45%] left-[45%] bg-white text-gray-800 text-xs md:text-sm font-bold border-2 border-gray-800 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
              title="Medium Risk - 8 items"
            >
              8
            </div>
            <div
              className="absolute top-[70%] left-[15%] bg-white text-gray-800 text-xs md:text-sm font-bold border-2 border-gray-800 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
              title="High Risk - 5 items"
            >
              5
            </div>

            {/* Axis Labels with enhanced styling */}
            <div className="absolute left-[-40px] md:left-[-50px] top-[45%] rotate-[-90deg] text-sm md:text-base font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm">
              Impact →
            </div>
            <div className="absolute bottom-[-30px] md:bottom-[-35px] left-[45%] text-sm md:text-base font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm">
              Likelihood →
            </div>

            {/* Y-Axis Ticks with enhanced styling */}
            <div className="absolute left-[-35px] md:left-[-45px] top-[5%] text-xs md:text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">Low</div>
            <div className="absolute left-[-45px] md:left-[-55px] top-[40%] text-xs md:text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">Medium</div>
            <div className="absolute left-[-35px] md:left-[-45px] bottom-0 text-xs md:text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">High</div>

            {/* X-Axis Ticks with enhanced styling */}
            <div className="absolute bottom-[-25px] md:bottom-[-30px] left-0 text-xs md:text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">High</div>
            <div className="absolute bottom-[-25px] md:bottom-[-30px] left-[45%] text-xs md:text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">Medium</div>
            <div className="absolute bottom-[-25px] md:bottom-[-30px] right-0 text-xs md:text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">Low</div>
          </div>
          
          <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-xs md:text-sm text-orange-700 font-medium">
              🎯 Visual representation of risk distribution by impact and likelihood
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;
