import React from "react";

const AgentStatusSummary = ({ agentSummary }) => {
  const agentStatusBoxes = [
    { title: "Total Agents", count: agentSummary.total || 0, color: "text-blue-600" },
    { title: "Active Agents", count: agentSummary.active || 0, color: "text-green-600" },
    { title: "Disconnected Agents", count: agentSummary.disconnected || 0, color: "text-red-600" },
    { title: "Pending Agents", count: agentSummary.pending || 0, color: "text-yellow-600" },
    { title: "Never Connected", count: agentSummary.neverConnected || 0, color: "text-gray-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {agentStatusBoxes.map((box, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700">{box.title}</h3>
          <p className={`text-4xl font-bold mt-2 ${box.color}`}>{box.count}</p>
        </div>
      ))}
    </div>
  );
};

export default AgentStatusSummary; 