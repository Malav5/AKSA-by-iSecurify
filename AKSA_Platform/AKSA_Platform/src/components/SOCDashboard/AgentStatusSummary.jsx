import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgentStatusSummary = () => {
  const [agentSummary, setAgentSummary] = useState({
    total: 0,
    active: 0,
    disconnected: 0,
    pending: 0,
    neverConnected: 0,
    unknown: 0,
  });

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/wazuh/agents');
        const agentItems = res?.data?.data?.affected_items ?? [];
        const summary = {
          total: agentItems.length,
          active: 0,
          disconnected: 0,
          pending: 0,
          neverConnected: 0,
          unknown: 0,
        };
        agentItems.forEach(agent => {
          switch (agent.status) {
            case 'active': summary.active++; break;
            case 'disconnected': summary.disconnected++; break;
            case 'pending': summary.pending++; break;
            case 'never_connected': summary.neverConnected++; break;
            default: summary.unknown++;
          }
        });
        setAgentSummary(summary);
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    };
    fetchAgentData();
  }, []);

  const agentStatusBoxes = [
    { title: 'Total Agents', count: agentSummary.total, color: 'text-blue-600', bg: 'bg-blue-200' },
    { title: 'Active Agents', count: agentSummary.active, color: 'text-green-600', bg: 'bg-green-200' },
    { title: 'Disconnected Agents', count: agentSummary.disconnected, color: 'text-red-600', bg: 'bg-red-200' },
    { title: 'Pending Agents', count: agentSummary.pending, color: 'text-orange-600', bg: 'bg-orange-200' },
    { title: 'Never Connected', count: agentSummary.neverConnected, color: 'text-gray-600', bg: 'bg-blue-100' },
    { title: 'Unknown Status', count: agentSummary.unknown, color: 'text-purple-600', bg: 'bg-purple-200' },
  ];

  return (
    <div className="flex flex-wrap gap-6 justify-center mb-8">
      {agentStatusBoxes.map((box, index) => (
        <div
          key={index}
          className={`${box.bg} rounded-2xl flex flex-col items-center justify-center h-36 min-w-[325px] shadow transition-all duration-300`}
        >
          <div className={`text-5xl font-bold ${box.color}`}>{box.count}</div>
          <div className="mt-2 text-base font-medium text-gray-700">{box.title}</div>
        </div>
      ))}
    </div>
  );
};

export default AgentStatusSummary;
