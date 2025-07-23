import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart,
  Bar,
  XAxis as BarXAxis,
  YAxis as BarYAxis,
  CartesianGrid as BarCartesianGrid,
  Tooltip as BarTooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

// Risk Matrix Data
const data = [
  { id: 1, x: 1, y: 3, z: 100, action: "accept" },
  { id: 2, x: 2, y: 2, z: 110, action: "transfer" },
  { id: 3, x: 3, y: 1, z: 120, action: "mitigate" },
  { id: 4, x: 4, y: 3, z: 90, action: "accept" },
  { id: 5, x: 1, y: 1, z: 130, action: "initial" },
  { id: 6, x: 2, y: 3, z: 100, action: "transfer" },
  { id: 7, x: 3, y: 2, z: 110, action: "accept" },
  { id: 8, x: 4, y: 1, z: 100, action: "mitigate" },
  { id: 9, x: 1.5, y: 2.5, z: 105, action: "initial" },
  { id: 10, x: 2.5, y: 1.5, z: 115, action: "accept" },
  { id: 11, x: 3.5, y: 2.8, z: 95, action: "mitigate" },
  { id: 12, x: 2, y: 1, z: 110, action: "transfer" },
  { id: 13, x: 4, y: 2, z: 90, action: "initial" },
  { id: 14, x: 3, y: 3, z: 120, action: "mitigate" },
  { id: 15, x: 1, y: 2, z: 130, action: "accept" },
  { id: 16, x: 3.8, y: 2.5, z: 105, action: "initial" },
  { id: 17, x: 1.5, y: 1.5, z: 100, action: "accept" },
  { id: 18, x: 2.8, y: 1.2, z: 110, action: "transfer" },
];

// Get color based on action type
const getColor = (action) => {
  switch (action) {
    case "accept":
      return "#C4B5FD"; // Light Indigo
    case "transfer":
      return "#93C5FD"; // Light Blue
    case "mitigate":
      return "#F9A8D4"; // Light Pink
    case "initial":
      return "#FDE68A"; // Light Yellow
    default:
      return "#E5E7EB"; // Light Gray
  }
};



export default function ActivityLog({ activityLogData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Activity Log */}
      <div className="col-span-1">
        <div className="bg-white p-5 rounded shadow h-full">
          <h3 className="text-md font-semibold text-gray-700 mb-4">
            Activity Log
          </h3>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={activityLogData}>
              <BarCartesianGrid strokeDasharray="3 3" />
              <BarXAxis
                dataKey="date"
                tickFormatter={(date) => format(parseISO(date), "dd MMM")}
              />
              <BarYAxis />
              <BarTooltip />
              <Bar dataKey="actions" fill="#D8BFD8" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center text-sm text-gray-500 mt-2">
            Daily activity volume (issues resolved)
          </div>
        </div>
      </div>

      {/* Risk Matrix */}
      <div className="col-span-1">
        <div className="bg-white p-6 rounded shadow text-black h-full">
          <h2 className="text-md font-semibold text-gray-700 mb-4">
            Risk Matrix
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                dataKey="x"
                name="Likelihood"
                label={{
                  value: "Likelihood →",
                  position: "bottom",
                  fill: "#FFF",
                }}
                domain={[0, 5]}
                tick={{ fill: "#FFF" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Severity"
                label={{
                  value: "Severity ↑",
                  angle: -90,
                  position: "left",
                  fill: "#FFF",
                }}
                domain={[0, 5]}
                tick={{ fill: "#FFF" }}
              />
              <ZAxis type="number" dataKey="z" range={[60, 180]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                name="Risks"
                data={data}
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  const color = getColor(payload.action);
                  return (
                    <g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={20}
                        fill={color}
                        opacity={0.9}
                      />
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#000"
                        fontSize={12}
                        fontWeight={700}
                      >
                        {payload.id}
                      </text>
                    </g>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
