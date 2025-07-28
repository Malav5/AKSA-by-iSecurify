import React, { useState, useEffect } from "react";
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
import { fetchAllTasks } from "../../services/TaskServics";

// Helper to get ISO week string (YYYY-Www)
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(d.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    d.getFullYear() +
    "-W" +
    (1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7))
  );
}

const TaskManagement = ({ hideViewAll = false }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("weeks");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchAllTasks();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Calculate counts by status
  const statusCounts = {
    "To Do": 0,
    "In Progress": 0,
    "Review": 0,
    "Done": 0,
    // fallback for other statuses
    other: 0,
  };
  tasks.forEach((task) => {
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++;
    } else {
      statusCounts.other++;
    }
  });

  // Prepare data for charts
  const barData = [
    { name: "To Do", value: statusCounts["To Do"], color: "#3B82F6" },
    { name: "In Progress", value: statusCounts["In Progress"], color: "#F59E0B" },
    { name: "Review", value: statusCounts["Review"], color: "#F97316" },
    { name: "Done", value: statusCounts["Done"], color: "#10B981" },
  ];

  const totalTasks = tasks.length;
  const doneTasks = statusCounts["Done"];
  const taskScore = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // For trend data, group by week using createdAt
  const weekMap = {};
  const monthMap = {};
  tasks.forEach((task) => {
    if (!task.createdAt) return;
    // Weekly
    const week = getISOWeek(task.createdAt);
    if (!weekMap[week]) weekMap[week] = { label: week, todo: 0, done: 0 };
    weekMap[week].todo++;
    if (task.status === "Done") weekMap[week].done++;
    // Monthly
    const d = new Date(task.createdAt);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[month]) monthMap[month] = { label: month, todo: 0, done: 0 };
    monthMap[month].todo++;
    if (task.status === "Done") monthMap[month].done++;
  });
  // Sort by label ascending
  const weeklyTrend = Object.values(weekMap).sort((a, b) => (a.label > b.label ? 1 : -1));
  const monthlyTrend = Object.values(monthMap).sort((a, b) => (a.label > b.label ? 1 : -1));
  const trendData = viewMode === "weeks" ? weeklyTrend : monthlyTrend;

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
    <div className="w-full bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-gray-800 p-4 md:p-6 lg:p-8">
      <div>
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Task Management</h2>
          </div>
          {!hideViewAll && (
            <Link 
              to="/task-manager" 
              className="bg-gradient-to-r from-[#800080] to-[#a242a2] text-white rounded-xl px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-indigo-700"
            >
              View All Tasks
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="font-bold text-lg md:text-xl text-gray-800">Tasks by Status</h3>
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
            
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="font-bold text-center text-base md:text-lg text-blue-800">
                This week: {totalTasks} Tasks Tracked
              </p>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs md:text-sm text-blue-700 font-medium">
                📌 Overview of tasks by current status
              </p>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-transparent rounded-full translate-y-10 -translate-x-10 opacity-50"></div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
              <h3 className="font-bold text-lg md:text-xl text-gray-800">Completion Score</h3>
            </div>
            
            <div className="w-32 h-32 md:w-40 md:h-40 relative">
              <CircularProgressbar
                value={taskScore}
                text={`${taskScore}%`}
                styles={buildStyles({
                  textColor: "#4F46E5",
                  pathColor: "#6366F1",
                  trailColor: "#EEF2FF",
                  textSize: "24px",
                  fontWeight: "bold",
                  strokeLinecap: "round",
                })}
              />
            </div>
            
            <div className="mt-6 space-y-3 text-sm md:text-base text-gray-700">
              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200">
                <span className="font-medium">To Do</span>
                <span className="text-blue-600 font-bold">{statusCounts["To Do"]}</span>
              </div>
              <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3 border border-amber-200">
                <span className="font-medium">In Progress</span>
                <span className="text-amber-600 font-bold">{statusCounts["In Progress"]}</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <span className="font-medium">Done</span>
                <span className="text-emerald-600 font-bold">{statusCounts["Done"]}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <p className="text-xs md:text-sm text-indigo-700 font-medium">
                📈 Progress made toward completion
              </p>
            </div>
          </div>

          {/* Line Chart with toggle */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-purple-100 to-transparent rounded-full translate-y-14 translate-x-14 opacity-50"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
              <h3 className="font-bold text-lg md:text-xl text-gray-800">
                Task Trend by {viewMode === "weeks" ? "Week" : "Month"}
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
                  dataKey="todo" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="done" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs md:text-sm text-purple-700 font-medium">
                🔄 How your tasks are moving over time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
