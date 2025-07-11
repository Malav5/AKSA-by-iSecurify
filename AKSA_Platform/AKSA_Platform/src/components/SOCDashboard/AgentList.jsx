import React from 'react';
import { Trash2 } from 'lucide-react';
import AgentCharts from './AgentCharts'; // 👈 import chart component
import Navbar from './Navbar';
import { X } from 'lucide-react';
const AgentList = ({ agents, type, onSelectAgent, onDeleteAgent, onClose }) => {
  return (
    <div className="my-10 max-w-7xl mx-auto scrollbar-hide">
            {/* ✅ Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <Navbar />
      </div>

           {/* ✅ Close Button */}
      <div className="flex justify-end mt-30">
        <button
          onClick={onClose}
          className="flex items-center text-sm text-gray-600 hover:text-red-600 transition"
        >
          <X className="mr-1" size={18} />
          Close
        </button>
      </div>
      {/* Charts Above Table */}
      <AgentCharts agents={agents} />

      {/* Agent Table */}
      <div className="bg-white rounded-xl shadow-xl p-6 overflow-x-auto mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
          {type} Agents
        </h2>
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">Version</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {agents.map((agent, index) => {
              const rowStyle =
                index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-100';
              return (
                <tr key={agent.id} className={`cursor-pointer ${rowStyle}`}>
                  <td className="px-4 py-2" onClick={() => onSelectAgent(agent.id)}>
                    {agent.id}
                  </td>
                  <td className="px-4 py-2 font-medium" onClick={() => onSelectAgent(agent.id)}>
                    {agent.name}
                  </td>
                  <td className="px-4 py-2 capitalize" onClick={() => onSelectAgent(agent.id)}>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        agent.status === 'active'
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
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-4 py-2" onClick={() => onSelectAgent(agent.id)}>
                    {agent.ip || 'N/A'}
                  </td>
                  <td className="px-4 py-2" onClick={() => onSelectAgent(agent.id)}>
                    {agent.version || 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onDeleteAgent(agent.id)}
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
  );
};

export default AgentList;
