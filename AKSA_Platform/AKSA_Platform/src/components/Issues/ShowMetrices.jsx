import React, { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import TopMetricsCards from "./Metrices.jsx/TopMetricsCards";
import ActivityStatusCharts from "./Metrices.jsx/ActivityStatusCharts";
import GraphStatsCards from "./Metrices.jsx/GraphStatsCard";
import ActivityLog from "./Metrices.jsx/ActivityLog";
import { getDomainHealthData, fetchActivityLog } from "../../services/servicedomain";
import "react-circular-progressbar/dist/styles.css";
import "../../index.css";

const statusData = [
  { name: "In Progress", value: 55 },
  { name: "Unassigned", value: 10 },
  { name: "To Do", value: 23 },
  { name: "Resolved", value: 80 },
];

const criticalityData = [
  { name: "Critical", value: 70 },
  { name: "High", value: 100 },
  { name: "Medium", value: 40 },
  { name: "Low", value: 20 },
];

const ShowMetrices = ({ onCancel, domain = "" }) => {
  const [score, setScore] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  const [openIssuesData, setOpenIssuesData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [activityLogData, setActivityLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveDomain = domain || localStorage.getItem("savedDomain") || "";

  useEffect(() => {
    if (!effectiveDomain) return;

    const getActivityLog = async () => {
      try {
        const data = await fetchActivityLog(effectiveDomain);
        setActivityLogData(data);
      } catch (error) {
        console.error(
          `Failed to fetch activity log for ${effectiveDomain}:`,
          error
        );
      }
    };

    getActivityLog();
  }, [effectiveDomain]);

  useEffect(() => {
    if (!effectiveDomain) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getDomainHealthData(effectiveDomain);
        const diagnostics = data?.diagnostics || [];

        setScore(computeOverallScore(diagnostics));
        setPerformanceData(generatePerformanceFromDiagnostics(diagnostics));
        setOpenIssuesData(getIssueMetrics(diagnostics));
        setActivityData(processActivityData(diagnostics));
      } catch (error) {
        console.error(`Failed to fetch data for ${effectiveDomain}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [effectiveDomain]);

  const computeOverallScore = (diagnostics) => {
    let score = 100;
    diagnostics.forEach((diag) => {
      if (diag.level === "error") score -= 20;
      else if (diag.level === "warning") score -= 10;
    });
    return Math.max(0, Math.min(100, score));
  };

  const generatePerformanceFromDiagnostics = (diagnostics) => {
    const baseScore = computeOverallScore(diagnostics);
    const weeks = 7;
    const data = [];

    for (let i = 0; i < weeks; i++) {
      const offset = (weeks - 1 - i) * 5;
      const score = Math.max(0, baseScore - offset);

      data.push({
        week: `Week ${i + 1}`,
        ITAMaaS: Math.min(score + Math.floor(Math.random() * 4), 100),
        TVMaaS: Math.min(score + Math.floor(Math.random() * 3), 100),
        SEMAaS: Math.min(score + Math.floor(Math.random() * 5), 100),
      });
    }

    return data;
  };

  const getIssueMetrics = (diagnostics) => {
    const pastWeeksData = { spf: 3, dmarc: 2, dns: 1, mx: 1 };
    const thisWeekData = { spf: 0, dmarc: 0, dns: 0, mx: 0 };

    diagnostics.forEach((issue) => {
      if (["error", "warning"].includes(issue.level)) {
        if (issue.category === "spf") thisWeekData.spf++;
        if (issue.category === "dmarc") thisWeekData.dmarc++;
        if (issue.category === "dns") thisWeekData.dns++;
        if (issue.category === "mx") thisWeekData.mx++;
      }
    });

    return [
      {
        metric: "SPF",
        pastWeeks: pastWeeksData.spf,
        thisWeek: thisWeekData.spf,
      },
      {
        metric: "DMARC",
        pastWeeks: pastWeeksData.dmarc,
        thisWeek: thisWeekData.dmarc,
      },
      {
        metric: "DNS",
        pastWeeks: pastWeeksData.dns,
        thisWeek: thisWeekData.dns,
      },
      { metric: "MX", pastWeeks: pastWeeksData.mx, thisWeek: thisWeekData.mx },
    ];
  };

  const processActivityData = (diagnostics) => {
    const counts = { error: 0, warning: 0, info: 0 };

    diagnostics.forEach((d) => {
      if (counts[d.level] !== undefined) counts[d.level]++;
    });

    return [
      { name: "Error", value: counts.error },
      { name: "Warning", value: counts.warning },
      { name: "Info", value: counts.info },
    ];
  };

  const activityColors = ["#993399", "#B266B2", "#E0B3E0"];

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row min-h-screen bg-gray-50 scrollbar-hide">
      <Sidebar className="min-h-screen" />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-screen scrollbar-hide">
        <Header />
        <div className="flex items-center justify-between my-6">
          <h2 className="text-2xl font-semibold text-primary">
            Metrics Overview {effectiveDomain ? `for ${effectiveDomain}` : ""}
          </h2>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-[#f9ecf9] border border-[#CC99CC] text-primary rounded hover:bg-[#E0B3E0]"
          >
            ← Back
          </button>
        </div>

        <TopMetricsCards score={score} domain={effectiveDomain} />

        <GraphStatsCards
          performanceData={performanceData}
          openIssuesData={openIssuesData}
          loading={isLoading}
        />

        <ActivityStatusCharts
          activityData={activityData}
          statusData={statusData}
          criticalityData={criticalityData}
          loading={isLoading}
          activityColors={activityColors}
          statusColors={["#993399", "#B266B2", "#CC99CC", "#E0B3E0"]}
          criticalityColors={["#ef4444", "#f97316", "#facc15", "#22c55e"]}
        />

        <ActivityLog activityLogData={activityLogData} />

      </main>
    </div>
  );
};

export default ShowMetrices;
