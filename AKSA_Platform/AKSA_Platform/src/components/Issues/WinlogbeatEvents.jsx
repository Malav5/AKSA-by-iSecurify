import React, { useState, useEffect } from 'react';
import { fetchWinlogbeatData, getWinlogbeatStats } from '../../services/winlogbeatService';
import WinlogbeatMetrics from './WinlogbeatMetrics';
import { format } from 'date-fns';

const WinlogbeatEvents = ({ deviceId, eventType, eventId, severityLevel }) => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(deviceId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [selectedSeverity, setSelectedSeverity] = useState(severityLevel || '');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 50; // Number of events per page

  useEffect(() => {
    loadData();
  }, [selectedDevice, selectedSeverity]);

  const loadData = async () => {
     
    try {
      setLoading(true);
      setError(null);
      console.log('Loading Winlogbeat data...');
      const [eventsData, statsData] = await Promise.all([
        fetchWinlogbeatData(selectedDevice || null, null, selectedEventId || null, selectedSeverity || null),
        getWinlogbeatStats()
      ]);
      console.log('Winlogbeat data loaded successfully');
      console.log('Events data:', eventsData);
      console.log('Stats data:', statsData);
      console.log('Computers from stats:', statsData?.computers);
      setEvents(eventsData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error in loadData:', err);
      setError(err.message || 'Failed to load Winlogbeat data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate events for the current page
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Calculate total pages
  const totalPages = Math.ceil(events.length / eventsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getSeverityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEventIdKeyDown = (e) => {
    if (e.key === 'Enter') {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Winlogbeat Data</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="space-y-8">
         {/* Filters */}
         <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Event Filters</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="device-filter" className="font-medium">Device:</label>
              {selectedDevice ? (
                <span className="text-sm text-gray-600">({events.length} events for selected device)</span>
              ) : (
                stats?.computer_count !== undefined && (
                  <span className="text-sm text-gray-600">({stats.computer_count.length} monitored devices)</span>
                )
              )}
              <select
                id="device-filter"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">All Devices</option>
                {stats?.computers?.map((computer) => (
                  <option key={computer.key} value={computer.key}>
                    {computer.key}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="event-id-filter" className="font-medium">Event ID:</label>
              <input
                type="text"
                id="event-id-filter"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                onKeyDown={handleEventIdKeyDown}
                placeholder="Enter Event ID and press Enter"
                className="border rounded-md px-3 py-2 w-32"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="severity-filter" className="font-medium">Severity:</label>
              <select
                id="severity-filter"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">All Severities</option>
                {stats?.severityLevels?.map((severity) => (
                  <option key={severity.key} value={severity.key}>
                    {severity.key}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Metrics Dashboard */}
        <div className="bg-white rounded-lg shadow p-6">
         
          <WinlogbeatMetrics deviceId={selectedDevice} />
        </div>

       

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Security Events</h2>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Event ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Subject User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Target User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Message</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{event.computerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{event.eventId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{event.providerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{event.outcome}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{event.subjectUser}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{event.targetUser}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(event.level)}`}>
                        {event.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-normal max-h-20 overflow-y-auto">
                      <div className="max-h-20 overflow-y-auto">
                        {event.message}
                      </div>
                    </td>
                  </tr>
                ))}
                {currentEvents.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {events.length > eventsPerPage && (
            <div className="px-6 py-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === page ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinlogbeatEvents; 