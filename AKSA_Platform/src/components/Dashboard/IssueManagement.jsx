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
    { name: "Medium", value: 4, color: "#F59E0B" },
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 backdrop-blur-sm">
          <p className="font-bold text-gray-800 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-gray-600 text-sm">
              {entry.name}: <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white text-gray-800 p-4 md:p-6 lg:p-8">
      <div>
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-gradient-to-b from-red-500 to-orange-600 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Issues Management</h2>
          </div>
          {!hideViewAll && (
            <Link
              to="/issues"
              className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white rounded-xl px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Issues
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="font-bold text-lg md:text-xl text-gray-800">
                Open Issues by Criticality
              </h3>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fontWeight: 600 }} 
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12, fontWeight: 600 }} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <p className="font-bold text-center text-base md:text-lg text-emerald-800">
                This week: 15 Open Issues
              </p>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs md:text-sm text-blue-700 font-medium">
                💡 All your open issues by criticality level
              </p>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-transparent rounded-full translate-y-10 -translate-x-10 opacity-50"></div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
              <h3 className="font-bold text-lg md:text-xl text-gray-800">
                Current Status
              </h3>
            </div>
            
            <div className="w-32 h-32 md:w-40 md:h-40 relative">
              <CircularProgressbar
                value={issueScore}
                text={`${issueScore}`}
                styles={buildStyles({
                  textColor: "#7C3AED",
                  pathColor: "#A855F7",
                  trailColor: "#F3E8FF",
                  textSize: "24px",
                  fontWeight: "bold",
                  strokeLinecap: "round",
                })}
              />
            </div>
            
            <div className="mt-6 space-y-4 text-sm md:text-base text-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">To Do</span>
                </div>
                <span className="text-purple-600 font-bold text-lg">{toDoCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Unassigned</span>
                </div>
                <span className="text-gray-600 font-bold text-lg">{unassignedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">In Progress</span>
                </div>
                <span className="text-blue-600 font-bold text-lg">{inProgressCount}</span>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs md:text-sm text-purple-700 font-medium">
                💡 The current status of your issues
              </p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-orange-100 to-transparent rounded-full translate-y-14 translate-x-14 opacity-50"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
              <h3 className="font-bold text-lg md:text-xl text-gray-800">
                Trend by Criticality
              </h3>
            </div>
            
            <div className="flex justify-end mb-4">
              <div className="bg-gray-100 rounded-xl p-1">
                <button
                  className={`text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === "weeks"
                      ? "bg-white text-gray-800 shadow-md"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setViewMode("weeks")}
                >
                  Weeks
                </button>
                <button
                  className={`text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === "months"
                      ? "bg-white text-gray-800 shadow-md"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setViewMode("months")}
                >
                  Months
                </button>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12, fontWeight: 600 }} 
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12, fontWeight: 600 }} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Low"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  name="Medium"
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#F97316"
                  strokeWidth={3}
                  name="High"
                  dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Critical"
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-xs md:text-sm text-orange-700 font-medium">
                💡 How your issues are trending over time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueManagement;
