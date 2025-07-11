import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const DeviceManagement = ({ onAddAgent, onRemoveAgent }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  const location = useLocation();
  const isSOC = location.pathname === '/soc';
  const isAssignPage = location.pathname.startsWith('/assign-agent');

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

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/agentMap/users-with-role-user');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Failed to fetch users');
      }
    };

    fetchAgents();
    fetchUsers();
  }, []);

  const handleAssignClick = (agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedUser) return alert("Please select a user.");
    if (!selectedAgent) return alert("No agent selected.");
    // Find user name from users array
    const user = users.find(u => u.email === selectedUser);
    if (!user) return alert("User not found.");
    try {
      await axios.post('/api/agentMap/assign-agent-to-user', {
        userEmail: user.email,
        userName: user.name,
        agentName: selectedAgent.name || selectedAgent.id,
        agentId: selectedAgent.id,
        agentIp: selectedAgent.ip || '',
      });
      alert('Agent assigned successfully!');
    } catch (err) {
      alert('Failed to assign agent.');
    }
    setShowModal(false);
    setSelectedAgent(null);
    setSelectedUser('');
  };

  return (
    <div className="my-8">
      <h2 className="text-3xl font-bold mb-3">Device Management</h2>

      <div className="bg-white rounded-lg shadow p-4 relative overflow-hidden">
        <img
          src="/logo1.svg"
          alt="bg"
          className="absolute right-0 top-0 opacity-10 w-1/2 pointer-events-none"
        />

        <div className="flex justify-between items-center mb-2 relative z-10">
          <h3 className="text-2xl font-semibold text-gray-700">Added Devices:</h3>
          {!isAssignPage && (
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white text-xl hover:bg-blue-700"
              onClick={onAddAgent}
            >
              + Add Agent
            </button>
          )}
        </div>

        <div className="relative z-10">
          {loading ? (
            <p className="text-gray-600">Loading devices...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-500 font-medium uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-gray-500 font-medium uppercase tracking-wider">IP</th>
                      <th className="px-6 py-3 text-left text-gray-500 font-medium uppercase tracking-wider">Status</th>
                      {!isSOC && (
                        <th className="px-6 py-3 text-left text-gray-500 font-medium uppercase tracking-wider">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {agents.map((agent, index) => (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="px-6 py-4 flex items-center gap-2 text-gray-800">
                          {(() => {
                            const os = agent.os?.name?.toLowerCase?.() || '';
                            if (os.includes('windows')) return <>🪟</>;
                            if (os.includes('mac')) return <>🍏</>;
                            if (os.includes('linux')) return <>🐧</>;
                            return <>💻</>;
                          })()}{" "}
                          {agent.name || agent.id}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{agent.ip || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              agent.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {agent.status || 'Unknown'}
                          </span>
                        </td>
                        {!isSOC && (
                          <td className="px-6 py-4">
                            <button
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                              onClick={() => handleAssignClick(agent)}
                            >
                              Assign User
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {!isAssignPage && (
          <div className="flex justify-end mt-4 relative z-10">
            <button
              className="px-4 py-2 rounded bg-red-600 text-white text-xl hover:bg-red-700"
              onClick={onRemoveAgent}
            >
              - Remove Agent
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Assign Agent</h3>
            <p className="mb-2">
              Agent:{" "}
              <span className="font-semibold">
                {selectedAgent?.name || selectedAgent?.id}
              </span>
            </p>
            <label className="block mb-2 text-sm font-medium text-gray-700">Select User:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            >
              <option value="">-- Select User --</option>
              {users.map((user) => (
                <option key={user.email} value={user.email}>{user.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;
