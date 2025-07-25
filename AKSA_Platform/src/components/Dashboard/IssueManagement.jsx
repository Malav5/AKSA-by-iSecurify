import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const IssueManagement = ({ hideViewAll = false }) => {
  const [viewMode, setViewMode] = useState("weeks");

  // 🔵 Static Bar Data
  const barData = [
    { name: "Low", value: 6, color: "#10B981" },
    { name: "Medium", value: 4, color: "#FACC15" },
    { name: "High", value: 3, color: "#F97316" },
    { name: "Critical", value: 2, color: "#EF4444" },
  ];

  // 🔵 Static Line Chart Data
  const trendData =
    viewMode === "weeks"
      ? [
          { label: "W27", low: 1, medium: 2, high: 1, critical: 0 },
          { label: "W28", low: 2, medium: 1, high: 1, critical: 1 },
          { label: "W29", low: 3, medium: 1, high: 1, critical: 1 },
        ]
      : [
          { label: "May", low: 2, medium: 1, high: 1, critical: 0 },
          { label: "Jun", low: 3, medium: 1, high: 1, critical: 1 },
          { label: "Jul", low: 1, medium: 2, high: 1, critical: 1 },
        ];

  // 🔵 Static Score and Status
  const issueScore = 15;
  const toDoCount = 5;
  const unassignedCount = 4;
  const inProgressCount = 6;

  return (
    <div className="w-full bg-white text-gray-800 p-3 md:p-4 lg:p-6">
      <div>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Issues Management</h2>
          {!hideViewAll && (
            <Link
              to="/issues"
              className="text-primary cursor-pointer underline text-sm md:text-base"
            >
              View all
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow">
            <h3 className="font-semibold mb-2 text-sm md:text-base">
              Open Issues by Criticality
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 md:mt-4 font-bold text-center text-sm md:text-base">
              This week: 15 Open Issues
            </p>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border-custom rounded-lg p-2 text-primary cursor-pointer">
              💡 All your open issues by criticality
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow flex flex-col items-center justify-center">
            <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
              Current Status
            </h3>
            <div className="w-24 h-24 md:w-32 md:h-32">
              <CircularProgressbar
                value={issueScore}
                text={`${issueScore}`}
                styles={buildStyles({
                  textColor: "#6B21A8",
                  pathColor: "#C084FC",
                  trailColor: "#EDE9FE",
                  textSize: "16px",
                })}
              />
            </div>
            <div className="mt-3 md:mt-4 space-y-1 text-xs md:text-sm text-gray-700">
              <p>
                <span className="text-purple-500 font-bold">{toDoCount}</span>{" "}
                To Do
              </p>
              <p>
                <span className="text-gray-500 font-bold">
                  {unassignedCount}
                </span>{" "}
                Unassigned
              </p>
              <p>
                <span className="text-gray-400 font-bold">
                  {inProgressCount}
                </span>{" "}
                In Progress
              </p>
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border-custom rounded-lg p-2 text-primary cursor-pointer">
              💡 The current status of your issues
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow">
            <h3 className="font-semibold mb-2 text-sm md:text-base">
              Trend by Criticality
            </h3>
            <div className="flex justify-end mb-1">
              <button
                className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded mr-1 md:mr-2 ${
                  viewMode === "weeks"
                    ? "bg-gray-200 text-gray-700"
                    : "text-gray-500"
                }`}
                onClick={() => setViewMode("weeks")}
              >
                Weeks
              </button>
              <button
                className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded ${
                  viewMode === "months"
                    ? "bg-gray-200 text-gray-700"
                    : "text-gray-500"
                }`}
                onClick={() => setViewMode("months")}
              >
                Months
              </button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#10B981"
                  name="Low"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#FACC15"
                  name="Medium"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#F97316"
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#EF4444"
                  name="Critical"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border-custom rounded-lg p-2 text-primary cursor-pointer">
              💡 How your issues are trending over time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueManagement;
