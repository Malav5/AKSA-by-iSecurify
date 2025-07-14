import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AgentList from './AgentList';

const AgentStatusSummary = () => {
  const [agents, setAgents] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAgentList, setShowAgentList] = useState(false);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get('http://localhost:3000/api/wazuh/agents', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const items = res?.data?.data?.affected_items ?? [];
  
        const counts = {
          total: items.length,
          active: 0,
          disconnected: 0,
          pending: 0,
          never_connected: 0,
          unknown: 0,
        };
  
        items.forEach(agent => {
          switch (agent.status) {
            case 'active': counts.active++; break;
            case 'disconnected': counts.disconnected++; break;
            case 'pending': counts.pending++; break;
            case 'never_connected': counts.never_connected++; break;
            default: counts.unknown++;
          }
        });
  
        setAgents(items);
        setSummary(counts);
      } catch (err) {
        console.error('Error fetching agents:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAgents();
  }, []);
  

  const handleBoxClick = (type) => {
    let filtered = [];

    if (type === 'total') {
      filtered = agents;
    } else {
      filtered = agents.filter(agent => {
        if (type === 'neverConnected') return agent.status === 'never_connected';
        return agent.status === type;
      });
    }

    setFilteredAgents(filtered);
    setSelectedType(type);
    setShowAgentList(true);
  };

  const agentStatusBoxes = [
    { key: 'total', title: 'Total Agents', count: summary.total, color: 'text-blue-600', bg: 'bg-blue-200' },
    { key: 'active', title: 'Active Agents', count: summary.active, color: 'text-green-600', bg: 'bg-green-200' },
    { key: 'disconnected', title: 'Disconnected Agents', count: summary.disconnected, color: 'text-red-600', bg: 'bg-red-200' },
    { key: 'pending', title: 'Pending Agents', count: summary.pending, color: 'text-orange-600', bg: 'bg-orange-200' },
    { key: 'neverConnected', title: 'Never Connected', count: summary.never_connected, color: 'text-gray-600', bg: 'bg-blue-100' },
    { key: 'unknown', title: 'Unknown Status', count: summary.unknown, color: 'text-purple-600', bg: 'bg-purple-200' },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-6 justify-center mb-8">
        {agentStatusBoxes.map((box, index) => (
          <div
            key={index}
            className={`${box.bg} rounded-2xl flex flex-col items-center justify-center h-36 min-w-[325px] hover:shadow-xl hover:scale-[1.01] shadow cursor-pointer transition-all duration-300`}
            onClick={() => handleBoxClick(box.key)}
          >
            <div className={`text-5xl font-bold ${box.color}`}>
              {loading ? '0' : box.count}
            </div>
            <div className="mt-2 text-base font-medium text-gray-700">{box.title}</div>
          </div>
        ))}
      </div>

      {showAgentList && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto shadow-xl scrollbar-hide">
          <AgentList
            agents={filteredAgents}
            type={selectedType}
            onSelectAgent={(id) => console.log('Selected Agent:', id)}
            onDeleteAgent={(id) => console.log('Delete Agent:', id)}
            onClose={() => setShowAgentList(false)}
          />
        </div>
      )}
    </>
  );
};

export default AgentStatusSummary;
