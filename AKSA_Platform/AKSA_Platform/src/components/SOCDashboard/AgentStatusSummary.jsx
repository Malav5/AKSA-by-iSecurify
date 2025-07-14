import React, { useEffect, useState } from 'react';
import axios from 'axios';

const baseURL = 'http://localhost:3000';

const AgentStatusSummary = () => {
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    disconnected: 0,
    pending: 0,
    never_connected: 0,
    unknown: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusSummary = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      let assignedAgentIds = [];

      if (userRole === 'admin') {
        // Admin: show all agents
        const wazuhRes = await axios.get(`${baseURL}/api/wazuh/agents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const wazuhAgents = wazuhRes.data?.data?.affected_items || [];
        countAndSetSummary(wazuhAgents);
        setLoading(false);
        return;
      }

      // User: fetch assigned agent IDs
      const userEmail = localStorage.getItem('soc_email');
      if (!userEmail) {
        setSummary({
          total: 0, active: 0, disconnected: 0, pending: 0, never_connected: 0, unknown: 0
        });
        setLoading(false);
        return;
      }
      // Get assigned agents
      const assignedRes = await axios.get(`${baseURL}/api/agentMap/assigned-agents`, {
        params: { userEmail },
        headers: { Authorization: `Bearer ${token}` },
      });
      const assignedAgents = assignedRes.data.agents || [];
      assignedAgentIds = assignedAgents.map(a => String(a.agentId).padStart(3, '0'));

      // Fetch all wazuh agents
      const wazuhRes = await axios.get(`${baseURL}/api/wazuh/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wazuhAgents = wazuhRes.data?.data?.affected_items || [];

      // Filter only assigned agents
      const filteredAgents = wazuhAgents.filter(agent =>
        assignedAgentIds.includes(String(agent.id).padStart(3, '0'))
      );

      countAndSetSummary(filteredAgents);
      setLoading(false);
    };

    function countAndSetSummary(agents) {
      const counts = {
        total: agents.length,
        active: 0,
        disconnected: 0,
        pending: 0,
        never_connected: 0,
        unknown: 0,
      };
      agents.forEach(agent => {
        switch (agent.status) {
          case 'active': counts.active++; break;
          case 'disconnected': counts.disconnected++; break;
          case 'pending': counts.pending++; break;
          case 'never_connected': counts.never_connected++; break;
          default: counts.unknown++;
        }
      });
      setSummary(counts);
    }

    fetchStatusSummary();
  }, []);

  // UI rendering (unchanged, but uses summary)
  const agentStatusBoxes = [
    { key: 'total', title: 'Total Agents', count: summary.total, color: 'text-blue-600', bg: 'bg-blue-200' },
    { key: 'active', title: 'Active Agents', count: summary.active, color: 'text-green-600', bg: 'bg-green-200' },
    { key: 'disconnected', title: 'Disconnected Agents', count: summary.disconnected, color: 'text-red-600', bg: 'bg-red-200' },
    { key: 'pending', title: 'Pending Agents', count: summary.pending, color: 'text-orange-600', bg: 'bg-orange-200' },
    { key: 'never_connected', title: 'Never Connected', count: summary.never_connected, color: 'text-gray-600', bg: 'bg-blue-100' },
    { key: 'unknown', title: 'Unknown Status', count: summary.unknown, color: 'text-purple-600', bg: 'bg-purple-200' },
  ];

  return (
    <div className="flex flex-wrap gap-6 justify-center mb-8">
      {agentStatusBoxes.map((box, index) => (
        <div
          key={index}
          className={`${box.bg} rounded-2xl flex flex-col items-center justify-center h-36 min-w-[325px] hover:shadow-xl hover:scale-[1.01] shadow cursor-pointer transition-all duration-300`}
        >
          <div className={`text-5xl font-bold ${box.color}`}>
            {loading ? '0' : box.count}
          </div>
          <div className="mt-2 text-base font-medium text-gray-700">{box.title}</div>
        </div>
      ))}
    </div>
  );
};

export default AgentStatusSummary;
