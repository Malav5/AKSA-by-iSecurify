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
    { name: "In Progress", value: statusCounts["In Progress"], color: "#FACC15" },
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

  return (
    <div className="w-full bg-white text-gray-800 p-3 md:p-4 lg:p-6 rounded-lg shadow">
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
          <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-2xl p-3 md:p-4 shadow-xl border border-purple-100">
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
              This week: {totalTasks} Tasks Tracked
            </p>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border border-custom rounded-lg p-2 text-primary cursor-pointer">
              📌 Overview of tasks by current status
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-2xl p-3 md:p-4 shadow-xl flex flex-col items-center justify-center border border-purple-100">
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
                <span className="text-blue-500 font-bold">{statusCounts["To Do"]}</span> To Do
              </p>
              <p>
                <span className="text-yellow-500 font-bold">{statusCounts["In Progress"]}</span> In Progress
              </p>
              <p>
                <span className="text-green-500 font-bold">{statusCounts["Done"]}</span> Done
              </p>
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border border-custom rounded-lg p-2 text-primary cursor-pointer">
              📈 Progress made toward completion
            </div>
          </div>

          {/* Line Chart with toggle */}
          <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-2xl p-3 md:p-4 shadow-xl border border-purple-100">
            <h3 className="font-semibold mb-2 text-sm md:text-base">Task Trend by {viewMode === "weeks" ? "Week" : "Month"}</h3>
            <div className="flex justify-end mb-1">
              <button
                className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded mr-1 md:mr-2 ${viewMode === "weeks" ? "bg-gray-200 text-gray-700" : "text-gray-500"
                  }`}
                onClick={() => setViewMode("weeks")}
              >
                Weeks
              </button>
              <button
                className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded ${viewMode === "months" ? "bg-gray-200 text-gray-700" : "text-gray-500"
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
