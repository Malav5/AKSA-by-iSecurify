import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AgentList from './AgentList'; // Import the modal
import { fetchAssignedAgents } from '../../services/SOCservices';

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

  // Modal state
  const [showAgentList, setShowAgentList] = useState(false);
  const [agentList, setAgentList] = useState([]);
  const [filteredAgentList, setFilteredAgentList] = useState([]);
  const [agentListType, setAgentListType] = useState('All');

  useEffect(() => {
    const fetchAgentsAndSummary = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      let agents = [];
      if (userRole === 'admin') {
        // Admin: fetch all agents
        const wazuhRes = await axios.get(`${baseURL}/api/wazuh/agents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        agents = wazuhRes.data?.data?.affected_items || [];
      } else {
        // User: fetch assigned agent IDs, then fetch all agents and filter
        const userEmail = localStorage.getItem('soc_email');
        if (!userEmail) {
          setAgentList([]);
          setSummary({
            total: 0, active: 0, disconnected: 0, pending: 0, never_connected: 0, unknown: 0
          });
          setLoading(false);
          return;
        }
        // 1. Get assigned agent IDs
        const assignedAgents = await fetchAssignedAgents(userEmail, token);
        const assignedAgentIds = (assignedAgents || []).map(a => String(a.agentId).padStart(3, '0'));

        // 2. Fetch all agents from Wazuh
        const wazuhRes = await axios.get(`${baseURL}/api/wazuh/agents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const wazuhAgents = wazuhRes.data?.data?.affected_items || [];

        // 3. Filter only assigned agents
        agents = wazuhAgents.filter(agent =>
          assignedAgentIds.includes(String(agent.id).padStart(3, '0'))
        );
      }
      setAgentList(agents);
      countAndSetSummary(agents);
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

    fetchAgentsAndSummary();
  }, []);

  // Handler for status box click
  const handleStatusBoxClick = (statusKey) => {
    let filtered = [];
    if (statusKey === 'total') {
      filtered = agentList;
    } else if (statusKey === 'unknown') {
      filtered = agentList.filter(agent => !['active', 'disconnected', 'pending', 'never_connected'].includes(agent.status));
    } else {
      filtered = agentList.filter(agent => agent.status === statusKey);
    }
    setFilteredAgentList(filtered);
    setAgentListType(statusKey === 'total' ? 'All' : statusKey.charAt(0).toUpperCase() + statusKey.slice(1));
    setShowAgentList(true);
  };

  // UI rendering (unchanged, but uses summary)
  const agentStatusBoxes = [
    { key: 'total', title: 'Total Agents', count: summary.total, color: 'text-blue-600', bg: 'bg-blue-200', shadow: 'shadow-blue-300/20' },
    { key: 'active', title: 'Active Agents', count: summary.active, color: 'text-green-600', bg: 'bg-green-200', shadow: 'shadow-green-300/20' },
    { key: 'disconnected', title: 'Disconnected Agents', count: summary.disconnected, color: 'text-red-600', bg: 'bg-red-200', shadow: 'shadow-red-300/20' },
    { key: 'pending', title: 'Pending Agents', count: summary.pending, color: 'text-orange-600', bg: 'bg-orange-200', shadow: 'shadow-orange-300/20' },
    { key: 'never_connected', title: 'Never Connected', count: summary.never_connected, color: 'text-gray-600', bg: 'bg-blue-100', shadow: 'shadow-blue-200/60' },
    { key: 'unknown', title: 'Unknown Status', count: summary.unknown, color: 'text-purple-600', bg: 'bg-purple-200', shadow: 'shadow-purple-300/20' },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-6 justify-center mb-8">
        {agentStatusBoxes.map((box, index) => (
          <div
            key={index}
            className={`${box.bg} rounded-2xl flex flex-col items-center justify-center h-36 min-w-[325px] hover:shadow-xl hover:scale-[1.01] shadow ${box.shadow} cursor-pointer transition-all duration-300`}
            onClick={() => handleStatusBoxClick(box.key)}
          >
            <div className={`text-5xl font-bold ${box.color}`}>
              {loading ? '0' : box.count}
            </div>
            <div className="mt-2 text-base font-medium text-gray-700">{box.title}</div>
          </div>
        ))}
      </div>
      {showAgentList && (
        <AgentList
          agents={filteredAgentList}
          type={agentListType}
          onSelectAgent={() => { }}
          onDeleteAgent={() => { }}
          onClose={() => setShowAgentList(false)}
        />
      )}
    </>
  );
};

export default AgentStatusSummary;
