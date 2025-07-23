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
import { fetchAllAlerts } from "../../services/SOCservices";

const IssueManagement = ({ hideViewAll = false }) => {
  const [alerts, setAlerts] = useState([]);
  const [viewMode, setViewMode] = useState("weeks");
  const [issueScore, setIssueScore] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      const res = await fetchAllAlerts();
      if (res?.hits?.hits) {
        const alertList = res.hits.hits.map(hit => hit._source);
        setAlerts(alertList);

        const score = Math.min(100, alertList.length);
        setIssueScore(score);
      }
    };
    fetchAlerts();
  }, []);

  const countByLevel = (level) =>
    alerts.filter(alert => alert.rule?.level === level).length;

  const countRange = (min, max) =>
    alerts.filter(alert => alert.rule?.level >= min && alert.rule?.level <= max).length;

  const barData = [
    { name: "Low", value: countRange(0, 4), color: "#10B981" },
    { name: "Medium", value: countRange(5, 8), color: "#FACC15" },
    { name: "High", value: countRange(8, 12), color: "#F97316" },
    { name: "Critical", value: countRange(12, 14), color: "#EF4444" },
  ];

  // Generate weekly/monthly trend data
  const groupAlertsByWeekOrMonth = (mode) => {
    const grouped = {};
    alerts.forEach((alert) => {
      const date = new Date(alert.timestamp);
      let label, sortKey;
      if (mode === "weeks") {
        const year = date.getFullYear();
        const week = Math.ceil(((date - new Date(year, 0, 1)) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
        label = `W${week}`;
        sortKey = `${year}-W${week.toString().padStart(2, '0')}`;
      } else {
        const year = date.getFullYear();
        const month = date.getMonth();
        label = date.toLocaleString("default", { month: "short" });
        sortKey = `${year}-${month.toString().padStart(2, '0')}`;
      }
      if (!grouped[sortKey]) grouped[sortKey] = { label, low: 0, medium: 0, high: 0, critical: 0, sortKey };
      const level = alert.rule?.level || 0;
      if (level >= 0 && level <= 4) grouped[sortKey].low++;
      else if (level >= 5 && level <= 8) grouped[sortKey].medium++;
      else if (level >= 9 && level <= 12) grouped[sortKey].high++;
      else if (level >= 13) grouped[sortKey].critical++;
    });
    // Sort by sortKey (chronologically)
    let arr = Object.values(grouped).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    // If only one data point, add a previous empty period for line visibility
    if (arr.length === 1) {
      const only = arr[0];
      let prevLabel, prevSortKey;
      if (mode === "weeks") {
        // Extract week and year
        const match = only.sortKey.match(/(\d+)-W(\d+)/);
        if (match) {
          let prevWeek = parseInt(match[2], 10) - 1;
          let prevYear = parseInt(match[1], 10);
          if (prevWeek < 1) {
            prevWeek = 52;
            prevYear -= 1;
          }
          prevLabel = `W${prevWeek}`;
          prevSortKey = `${prevYear}-W${prevWeek.toString().padStart(2, '0')}`;
        } else {
          prevLabel = 'W0';
          prevSortKey = '0000-W00';
        }
      } else {
        // Extract month and year
        const match = only.sortKey.match(/(\d+)-(\d+)/);
        if (match) {
          let prevMonth = parseInt(match[2], 10) - 1;
          let prevYear = parseInt(match[1], 10);
          if (prevMonth < 0) {
            prevMonth = 11;
            prevYear -= 1;
          }
          const date = new Date(prevYear, prevMonth, 1);
          prevLabel = date.toLocaleString("default", { month: "short" });
          prevSortKey = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
        } else {
          prevLabel = 'Prev';
          prevSortKey = '0000-00';
        }
      }
      arr = [
        { label: prevLabel, low: 0, medium: 0, high: 0, critical: 0, sortKey: prevSortKey },
        only
      ];
    }
    return arr;
  };

  const trendData = groupAlertsByWeekOrMonth(viewMode);

  return (
    <div className="w-full bg-white text-gray-800 p-3 md:p-4 lg:p-6">
      <div>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Issues Management</h2>
          {!hideViewAll && (
            <Link to="/issues" className="text-primary cursor-pointer underline text-sm md:text-base">
              View all
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow">
            <h3 className="font-semibold mb-2 text-sm md:text-base">Open Issues by Criticality</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 md:mt-4 font-bold text-center text-sm md:text-base">
              This week: {alerts.length} Open Issues
            </p>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border-custom rounded-lg p-2 text-primary cursor-pointer">
              💡 All your open issues by criticality
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow flex flex-col items-center justify-center">
            <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Current Status</h3>
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
                <span className="text-purple-500 font-bold">{countRange(3, 4)}</span> To Do
              </p>
              <p>
                <span className="text-gray-500 font-bold">{countRange(0, 2)}</span> Unassigned
              </p>
              <p>
                <span className="text-gray-400 font-bold">{countRange(5, 10)}</span> In Progress
              </p>
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm bg-white border-custom rounded-lg p-2 text-primary cursor-pointer">
              💡 The current status of your issues
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow">
            <h3 className="font-semibold mb-2 text-sm md:text-base">Trend by Criticality</h3>
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
                <Line type="monotone" dataKey="low" stroke="#10B981" name="Low" />
                <Line type="monotone" dataKey="medium" stroke="#FACC15" name="Medium" />
                <Line type="monotone" dataKey="high" stroke="#F97316" name="High" />
                <Line type="monotone" dataKey="critical" stroke="#EF4444" name="Critical" />
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
