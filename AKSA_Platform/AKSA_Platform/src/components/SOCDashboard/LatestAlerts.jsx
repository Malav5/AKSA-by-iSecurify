import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { fetchLatestAlerts, fetchAssignedAgents } from '../../services/SOCservices';
import AlertDetail from './AlertDetail';

const baseURL = 'http://localhost:3000';

const LatestAlerts = () => {
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    const loadLatestAlerts = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      if (userRole === 'admin') {
        // Admin: show all alerts
        const alerts = await fetchLatestAlerts();
        setLatestAlerts(transformAlerts(alerts));
        return;
      }
      // User: fetch assigned agent IDs
      const userEmail = localStorage.getItem('soc_email');
      if (!userEmail) {
        setLatestAlerts([]);
        return;
      }
      // Get assigned agents
      let assignedAgents = [];
      try {
        assignedAgents = await fetchAssignedAgents(userEmail, token);
      } catch (e) {
        setLatestAlerts([]);
        return;
      }
      const agentIds = assignedAgents.map(a => String(a.agentId).padStart(3, '0'));
      // Fetch all alerts, then filter for assigned agentIds
      const allAlerts = await fetchLatestAlerts();
      const filteredAlerts = allAlerts.filter(alert =>
        agentIds.includes(String(alert.agent?.id || alert.agentId).padStart(3, '0'))
      );
      setLatestAlerts(transformAlerts(filteredAlerts));
    };

    // Helper to transform alerts for display
    function transformAlerts(alerts) {
      return alerts.map((alert, index) => ({
        id: alert.id || index + 1,
        title: alert.rule?.description || 'No Title',
        description: alert.full_log || 'No Description',
        severity:
          alert.rule?.level >= 12
            ? 'critical'
            : alert.rule?.level >= 8
              ? 'high'
              : alert.rule?.level >= 4
                ? 'medium'
                : 'low',
        agentName: alert.agent?.name || 'Unknown Agent',
        time: alert.timestamp || 'N/A',
        rule: alert.rule || {},
        data: alert.data || {},
        decoder: alert.decoder || {},
        location: alert.location || 'N/A',
        agent: alert.agent || {},
        manager: alert.manager || {},
        input: alert.input || {},
        '@timestamp': alert['@timestamp'] || '',
        previous_output: alert.previous_output || '',
        previous_log: alert.previous_log || '',
      }));
    }

    loadLatestAlerts();
  }, []);

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6 transform transition-all duration-300 shadow-xl">
        <h3 className="text-2xl font-bold mb-4">Recent Logs</h3>
        {latestAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestAlerts.map((alert, index) => (
                  <tr
                    key={index}
                    className="transform transition-all duration-300 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                      {moment(alert.time).format('MM/DD HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-lg h-10 w-30 justify-center items-center leading-5 font-semibold rounded-full ${alert.severity === 'critical' ? 'bg-pink-100 text-pink-800' :
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-lg text-gray-500">{alert.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">{alert.agentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No recent alerts found.</p>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetail
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </>
  );
};

export default LatestAlerts;
