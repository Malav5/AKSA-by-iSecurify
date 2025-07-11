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
    <div className="my-8">
      <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
        Device Management
      </h2>
      <div className="bg-white rounded-lg shadow p-4 relative overflow-hidden animate-fade-in-up">
        <img
          src="/logo1.svg"
          alt="bg"
          className="absolute right-0 top-0 opacity-10 w-1/2 pointer-events-none select-none"
        />

        <div className="flex justify-between items-center mb-2 relative z-10">
          <h3 className="text-2xl p-3 font-semibold text-gray-700 flex items-center gap-2">
            Added Devices:
          </h3>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-2xl text-white hover:bg-blue-700 shadow flex items-center gap-1 transition-transform duration-200 hover:scale-110"
            onClick={onAddAgent}
          >
            + Add Agent
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
              <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
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
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="px-6 py-4 text-xl font-medium text-gray-900 flex items-center gap-2">
                          {(() => {
                            const os = agent.os?.name?.toLowerCase?.() || '';
                            if (os.includes('windows')) return <span title="Windows">🪟</span>;
                            if (os.includes('mac')) return <span title="macOS">🍏</span>;
                            if (os.includes('linux')) return <span title="Linux">🐧</span>;
                            return <span title="Other">💻</span>;
                          })()}
                          {agent.name || agent.id}
                        </td>
                        <td className="px-6 py-4 text-xl text-gray-500">{agent.ip || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 inline-flex text-xl font-semibold rounded-full ${
                              agent.status === 'active'
                                ? 'h-12 w-24 justify-center items-center bg-green-100 text-green-800 animate-pulse'
                                : 'h-12 w-36 justify-center items-center bg-gray-100 text-gray-800'
                            }`}
                          >
                            {agent.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 relative z-10">
          <button
            className="px-4 py-2 rounded bg-red-600 text-2xl text-white hover:bg-red-700 shadow flex items-center transition-transform duration-200 hover:scale-110"
            onClick={onRemoveAgent}
          >
            - Remove Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
