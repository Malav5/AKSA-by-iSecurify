import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PieChartCard = ({
  title,
  data,
  colors,
  totalLabel = "issues",
  innerContent,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-5 rounded shadow flex flex-col items-center">
      <h3 className="text-md font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="relative w-40 h-40 mb-4">
        <PieChart width={160} height={160}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-bold text-gray-800">
            {innerContent || total}
          </p>
          <p className="text-sm text-gray-500">{totalLabel}</p>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{
                backgroundColor: colors[index % colors.length],
              }}
            />
            <span>{`${item.value} ${item.name}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityStatusCharts = ({
  activityData,
  statusData,
  criticalityData,
  loading = false,
  activityColors = ["#6366f1", "#8b5cf6", "#a78bfa"],
  statusColors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"],
  criticalityColors = ["#ef4444", "#f97316", "#facc15", "#22c55e"],
}) => {
  const totalIssues = activityData.reduce(
    (total, item) => total + item.value,
    0
  );

  const currentStatusIssues = statusData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const totalCriticalityIssues = criticalityData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Activity Report */}
      {loading ? (
        <div className="bg-white p-5 rounded shadow flex flex-col items-center justify-center h-full w-full animate-pulse">
          <div className="w-32 h-32 rounded-full bg-gray-200 mb-4"></div>
          <div className="space-y-1 w-full flex flex-col items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex space-x-2 items-center justify-center"
              >
                <div className="w-3 h-3 bg-gray-300 rounded-full" />
                <div className="h-3 bg-gray-300 rounded w-30"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PieChartCard
          title="Activity Report"
          data={activityData}
          colors={activityColors}
          totalLabel="issues"
          innerContent={totalIssues}
        />
      )}

      {/* Current Status Rollup */}
      <PieChartCard
        title="Current Status Rollup"
        data={statusData}
        colors={statusColors}
        totalLabel="issues"
        innerContent={currentStatusIssues}
      />

      {/* Open Issues by Criticality */}
      <PieChartCard
        title="Open Issues by Criticality"
        data={criticalityData}
        colors={criticalityColors}
        totalLabel="issues"
        innerContent={totalCriticalityIssues}
      />
    </div>
  );
};

export default ActivityStatusCharts;