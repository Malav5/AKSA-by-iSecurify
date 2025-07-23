import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { fetchAssignedAgents } from '../../services/SOCservices';

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
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        if (userRole === "admin") {
          // Admin: fetch all agents
          const res = await axios.get('/api/wazuh/agents', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAgents(res.data.data.affected_items || []);
        } else {
          // Regular user: fetch only assigned agents with full details (including status)
          const userEmail = localStorage.getItem("soc_email");
          if (!userEmail) {
            setError("No user email found.");
            setLoading(false);
            return;
          }
          const assignedAgentsArr = await fetchAssignedAgents(userEmail, token);
          setAgents(assignedAgentsArr);
        }
      } catch (err) {
        setError('Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get('/api/agentMap/users-with-role-user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err.response?.data || err.message);
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
    const user = users.find(u => u.email === selectedUser);
    if (!user) return alert("User not found.");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post('/api/agentMap/assign-agent-to-user', {
        userEmail: user.email,
        userName: user.name,
        agentName: selectedAgent.name || selectedAgent.id,
        agentId: selectedAgent.id,
        agentIp: selectedAgent.ip || '',
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert(response.data.message);
    } catch (err) {
      console.error('Failed to assign agent:', err.response?.data || err.message);
      alert('Failed to assign agent.');
    }
    setShowModal(false);
    setSelectedAgent(null);
    setSelectedUser('');
  };

  return (
    <div className="my-10">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Device Management</h2>

      <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
        <img
          src="/logo1.svg"
          alt="bg"
          className="absolute right-0 top-0 opacity-10 w-1/2 pointer-events-none"
        />

        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-2xl font-bold text-gray-800">Added Devices</h3>
          {userRole === "admin" && !isAssignPage && (
            <button
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white text-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              onClick={onAddAgent}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Agent
            </button>
          )}
        </div>

        <div className="relative z-10">
          {loading ? (
            <p className="text-gray-600 text-lg py-8 text-center">Loading devices...</p>
          ) : error ? (
            <p className="text-red-600 text-lg py-8 text-center">{error}</p>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0 z-20">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-500 font-semibold uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-gray-500 font-semibold uppercase tracking-wider">IP</th>
                      <th className="px-6 py-3 text-left text-gray-500 font-semibold uppercase tracking-wider">Status</th>
                      {!isSOC && (
                        <th className="px-6 py-3 text-left text-gray-500 font-semibold uppercase tracking-wider">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {agents.map((agent, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 flex items-center gap-2 text-gray-900 font-medium">
                           {agent.agentName || agent.name || agent.id}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{agent.agentIp || agent.ip || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
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
                              className="px-4 py-1 bg-indigo-600 text-white text-sm rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
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

        {userRole === "admin" && !isAssignPage && (
          <div className="flex justify-end mt-6 relative z-10">
            <button
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-secondary text-primary text-lg font-bold shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              onClick={onRemoveAgent}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
              Remove Agent
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Assign Agent</h3>
            <p className="mb-3 text-gray-700">
              <span className="font-semibold">Agent:</span>{" "}
              <span className="font-bold text-gray-900">
                {selectedAgent?.name || selectedAgent?.id}
              </span>
            </p>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select User:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">-- Select User --</option>
              {users.map((user) => (
                <option key={user.email} value={user.email}>{user.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
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
