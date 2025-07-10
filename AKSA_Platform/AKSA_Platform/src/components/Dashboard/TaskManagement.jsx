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

const TaskManagement = ({ hideViewAll = false }) => {
  const taskScore = 75;
  const [viewMode, setViewMode] = useState("weeks");

  const barData = [
    { name: "To Do", value: 12, color: "#3B82F6" },
    { name: "In Progress", value: 6, color: "#FACC15" },
    { name: "Review", value: 3, color: "#F97316" },
    { name: "Done", value: 21, color: "#10B981" },
  ];

  const weeklyTrend = [
    { label: "W52", todo: 8, done: 10 },
    { label: "W53", todo: 10, done: 12 },
    { label: "W54", todo: 11, done: 14 },
    { label: "W55", todo: 13, done: 16 },
    { label: "W56", todo: 12, done: 18 },
    { label: "W57", todo: 10, done: 20 },
    { label: "W58", todo: 9, done: 22 },
    { label: "W59", todo: 6, done: 24 },
  ];

  const monthlyTrend = [
    { label: "Jan", todo: 40, done: 60 },
    { label: "Feb", todo: 35, done: 65 },
    { label: "Mar", todo: 30, done: 70 },
    { label: "Apr", todo: 28, done: 75 },
    { label: "May", todo: 25, done: 80 },
  ];

  const trendData = viewMode === "weeks" ? weeklyTrend : monthlyTrend;

  return (
    <div className="w-full bg-white text-gray-800 p-3 md:p-4 lg:p-6">
      <div>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Task Management</h2>
          {!hideViewAll && (
            <Link to="/task-manager" className="text-primary cursor-pointer underline text-sm md:text-base">
              View all
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow">
            <h3 className="font-semibold mb-2 text-sm md:text-base">Tasks by Status</h3>
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
              This week: 42 Tasks Tracked
            </p>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border border-custom rounded-lg p-2 text-primary cursor-pointer">
              📌 Overview of tasks by current status
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow flex flex-col items-center justify-center">
            <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Completion Score</h3>
            <div className="w-24 h-24 md:w-32 md:h-32">
              <CircularProgressbar
                value={taskScore}
                text={`${taskScore}%`}
                styles={buildStyles({
                  textColor: "#800080",
                  pathColor: "#d323d3",
                  trailColor: "#f9ecf9",
                  textSize: "16px",
                })}
              />
            </div>
            <div className="mt-3 md:mt-4 space-y-1 text-xs md:text-sm text-gray-700">
              <p>
                <span className="text-blue-500 font-bold">12</span> To Do
              </p>
              <p>
                <span className="text-yellow-500 font-bold">6</span> In Progress
              </p>
              <p>
                <span className="text-green-500 font-bold">21</span> Done
              </p>
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border border-custom rounded-lg p-2 text-primary cursor-pointer">
              📈 Progress made toward completion
            </div>
          </div>

          {/* Line Chart with toggle */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow">
            <h3 className="font-semibold mb-2 text-sm md:text-base">Task Trend by {viewMode === "weeks" ? "Week" : "Month"}</h3>
            <div className="flex justify-end mb-1">
              <button
                className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded mr-1 md:mr-2 ${
                  viewMode === "weeks" ? "bg-gray-200 text-gray-700" : "text-gray-500"
                }`}
                onClick={() => setViewMode("weeks")}
              >
                Weeks
              </button>
              <button
                className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded ${
                  viewMode === "months" ? "bg-gray-200 text-gray-700" : "text-gray-500"
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
                <Line type="monotone" dataKey="todo" stroke="#800080" />
                <Line type="monotone" dataKey="done" stroke="#10B981" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border border-custom rounded-lg p-2 text-primary cursor-pointer">
              🔄 How your tasks are moving over time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
