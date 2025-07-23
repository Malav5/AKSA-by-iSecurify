import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import AgentCharts from './AgentCharts';
import Navbar from './Navbar';
import AgentDetails from './AgentDetails';

const AgentList = ({ agents, type, onSelectAgent, onDeleteAgent, onClose }) => {
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Handler for clicking agent row (except delete button)
  const handleRowClick = (agentId) => {
    setSelectedAgentId(agentId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center scrollbar-hide">
      <div className="bg-white w-screen h-screen rounded-none shadow-xl relative overflow-y-auto">
        {/* Fixed Navbar at the top */}
        <div className="sticky top-0 z-20">
          <Navbar />
        </div>
        {/* Header with title and close button */}

        {/* Main content */}
        <div className="px-8 py-6 space-y-8 mx-40">
          <div className="z-10 bg-white mb-10 px-8 py-4 pt-16 flex justify-between items-center">
            <h1 className="text-2xl font-bold mt-10 text-gray-800 capitalize">
              {type} Agents Dashboard
            </h1>
            <button
              onClick={onClose}
              className="flex items-center gap-1 mt-10 text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              <X size={20} />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
          {/* Charts section */}
          <section>
            <AgentCharts agents={agents} />
          </section>
          {/* Agents table section */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Agents List
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {agents.length} {type.toLowerCase()} agents found
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent, index) => (
                    <tr
                      key={agent.id ? agent.id : `agent-row-${index}`}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => handleRowClick(agent.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.ip || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.version || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : agent.status === 'disconnected'
                              ? 'bg-red-100 text-red-800'
                              : agent.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : agent.status === 'never_connected'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}
                        >
                          {agent.status ? agent.status.replace('_', ' ') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAgent && onDeleteAgent(agent.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          title="Delete Agent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        {/* AgentDetails Modal Overlay */}
        {selectedAgentId && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white scrollbar-hide">
            {/* Sticky Navbar at the top of modal */}
            <div className="sticky top-0 z-50 bg-white shadow">
              <Navbar />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <AgentDetails agentId={selectedAgentId} onBack={() => setSelectedAgentId(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentList;