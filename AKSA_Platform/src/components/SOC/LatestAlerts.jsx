import React from 'react';
import moment from 'moment';

const LatestAlerts = ({ latestAlerts }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Latest Alerts</h2>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {latestAlerts.length > 0 ? (
          <ul>
            {latestAlerts.map((alert, index) => (
              <li key={alert.id || index} className="py-2 border-b last:border-b-0 text-sm text-gray-700">
                <span className="font-semibold mr-2">{moment(alert.timestamp).format('MM/DD HH:mm')}</span>
                <span className={`font-semibold ${alert.level >= 10 ? 'text-red-600' : alert.level >= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  Level {alert.level}:
                </span>{' '}
                {alert.rule.description} on agent <span className="font-semibold">{alert.agent.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recent alerts found.</p>
        )}
      </div>
    </div>
  );
};

export default LatestAlerts; 