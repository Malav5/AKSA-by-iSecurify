import React from 'react';
import { Trash2, X } from 'lucide-react';
import AgentCharts from './AgentCharts';
import Navbar from './Navbar';

const AgentList = ({ agents, type, onSelectAgent, onDeleteAgent, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-screen h-screen rounded-none shadow-2xl relative overflow-y-auto">
        {/* Fixed Navbar at the top */}
        <div className="sticky top-0 z-20">
          <Navbar />
        </div>
        {/* Close Button below Navbar */}
        <div className="flex justify-end p-4 mt-30 sticky top-[64px] bg-white z-10">
          <button
            onClick={onClose}
            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition"
          >
            <X className="mr-1" size={18} />
            Close
          </button>
        </div>
        {/* Charts and Table Content */}
        <div className="px-8 my-10">
          <AgentCharts agents={agents} />
          <div className="bg-white rounded-xl shadow-xl p-6 overflow-x-auto mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
              {type} Agents
            </h2>
            <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">IP</th>
                  <th className="px-4 py-3 text-left">Version</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {agents.map((agent, index) => {
                  const rowStyle =
                    index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-100';
                  return (
                    <tr key={agent.id ? agent.id : `agent-row-${index}`} className={`cursor-pointer ${rowStyle}`}>
                      <td className="px-4 py-2" onClick={() => onSelectAgent && onSelectAgent(agent.id)}>
                        {agent.id || 'N/A'}
                      </td>
                      <td className="px-4 py-2 font-medium" onClick={() => onSelectAgent && onSelectAgent(agent.id)}>
                        {agent.name || 'N/A'}
                      </td>
                      <td className="px-4 py-2" onClick={() => onSelectAgent && onSelectAgent(agent.id)}>
                        {agent.ip || 'N/A'}
                      </td>
                      <td className="px-4 py-2" onClick={() => onSelectAgent && onSelectAgent(agent.id)}>
                        {agent.version || 'N/A'}
                      </td>
                      <td className="px-4 py-2 capitalize" onClick={() => onSelectAgent && onSelectAgent(agent.id)}>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${agent.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : agent.status === 'disconnected'
                                ? 'bg-red-100 text-red-700'
                                : agent.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : agent.status === 'never_connected'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-purple-100 text-purple-700'
                            }`}
                        >
                          {agent.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => onDeleteAgent && onDeleteAgent(agent.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete Agent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentList;
