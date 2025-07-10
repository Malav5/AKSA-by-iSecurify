import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const GraphStatsCards = ({ performanceData, openIssuesData, loading }) => {
  const [timeRange, setTimeRange] = useState("week");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow h-[300px] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#B266B2] border-t-transparent rounded-full animate-spin mb-2"></div>
          <div className="text-gray-500">Loading Performance Chart...</div>
        </div>
        <div className="bg-white p-5 rounded shadow h-[300px] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#B266B2] border-t-transparent rounded-full animate-spin mb-2"></div>
          <div className="text-gray-500">Loading Issue Metrics...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Performance Over Time Chart */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-md font-semibold text-gray-700 mb-4">
          Performance Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid stroke="#E6CCEF" />
            <XAxis
              dataKey="week"
              label={{
                value: "Weeks",
                position: "insideBottom",
                offset: -20,
              }}
            />
            <YAxis
              label={{
                value: "Performance",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              horizontalAlign="center"
              height={36}
              wrapperStyle={{ padding: 50 }}
            />
            <Line
              type="monotone"
              dataKey="ITAMaaS"
              stroke="#800080"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="TVMaaS"
              stroke="#9932CC"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="SEMAaS"
              stroke="#B266B2"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Issue Metrics Comparison Chart */}
      <div className="bg-white p-5 rounded shadow">
        <h3 className="text-md font-semibold text-gray-700 mb-4">
          Issue Metrics Comparison
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={openIssuesData} barGap={20}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pastWeeks" fill="#D8BFD8" name="Past weeks" />
            <Bar dataKey="thisWeek" fill="#800080" name="This week" />
          </BarChart>
        </ResponsiveContainer>

        <div className="text-sm text-[#B266B2] mt-2 text-center">
          Weekly vs Historical trends for key issue metrics
        </div>

        {/* Toggle buttons */}
        <div className="flex justify-center mt-4 space-x-3">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-1 rounded-full text-sm ${
              timeRange === "week"
                ? "bg-primary text-white"
                : "bg-[#F3E8F3] text-primary"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-1 rounded-full text-sm ${
              timeRange === "month"
                ? "bg-primary text-white"
                : "bg-[#F3E8F3] text-primary"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange("90days")}
            className={`px-4 py-1 rounded-full text-sm ${
              timeRange === "90days"
                ? "bg-primary text-white"
                : "bg-[#F3E8F3] text-primary"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphStatsCards;
