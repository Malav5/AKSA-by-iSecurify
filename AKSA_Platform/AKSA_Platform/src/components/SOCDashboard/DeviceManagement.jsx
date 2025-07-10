import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DeviceManagement = ({ onAddAgent, onRemoveAgent }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/wazuh/agents');
        // Wazuh API returns agents in res.data.data.affected_items
        setAgents(res.data.data.affected_items || []);
      } catch (err) {
        setError('Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
        {/* <img src="/logo2.png" alt="Device" className="w-8 h-8 animate-bounce" /> */}
        Device Management
      </h2>
      <div className="bg-white rounded-lg shadow p-4 transform transition-all duration-300 hover:shadow-2xl hover:scale-100 relative overflow-hidden animate-fade-in-up">
        {/* Faint SVG background */}
        <img src="/logo1.svg" alt="bg" className="absolute right-0 top-0 opacity-10 w-1/2 pointer-events-none select-none" />
        {/* Devices List */}
        <div className="flex justify-between items-center mb-2 relative z-10">
          <h3 className="text-2xl p-3 font-semibold text-gray-700 flex items-center gap-2">
            {/* <img src="/logo2.png" alt="Device" className="w-6 h-6 animate-pulse" /> */}
            Added Devices:
          </h3>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-2xl text-white hover:bg-blue-700 shadow flex items-center gap-1 transition-transform duration-200 hover:scale-110 animate-fade-in"
            onClick={onAddAgent}
          >
            <span className="material-icons"></span> + Add Agent
          </button>
        </div>
        <div className="relative z-10">
          {loading ? (
            <p className="text-xl text-gray-600">Loading devices...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : agents.length === 0 ? (
            <p className="text-xl text-gray-600">No devices found.</p>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">IP</th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent, index) => (
                    <tr key={index} className="transition-colors duration-200 hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-xl font-medium text-gray-900 flex items-center gap-2">
                        {(() => {
                          const osString = agent.os?.name?.toLowerCase?.() || '';
                          if (osString.includes('windows')) return <span title="Windows" className="text-xl">🪟</span>;
                          if (osString.includes('mac')) return <span title="macOS" className="text-xl">🍏</span>;
                          if (osString.includes('linux')) return <span title="Linux" className="text-xl">🐧</span>;
                          return <span title="Other" className="text-xl">💻</span>;
                        })()}
                        {agent.name || agent.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">{agent.ip && agent.ip !== '' ? agent.ip : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xl leading-5 font-semibold rounded-full ${agent.status === 'active' ? 'h-12 w-24 items-center justify-center bg-green-100 text-green-800 animate-pulse' : 'h-12 w-36 items-center justify-center bg-gray-100 text-gray-800'}`}>
                          {agent.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4 relative z-10">
          <button
            className="px-4 py-2 rounded bg-red-600 text-2xl text-white hover:bg-red-700 shadow flex items-center transition-transform duration-200 hover:scale-110 animate-fade-in"
            onClick={onRemoveAgent}
          >
            <span className="material-icons"></span> - Remove Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;