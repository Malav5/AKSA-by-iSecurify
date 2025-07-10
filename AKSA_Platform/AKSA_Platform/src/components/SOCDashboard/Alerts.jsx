import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { AlertTriangle } from 'lucide-react';
import Navbar from './Navbar';
import { fetchAllAlerts, fetchPaginatedAlerts } from '../../services/SOCservices';
import AlertDetail from './AlertDetail';
ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const Alerts = () => {
  const [allAlerts, setAllAlerts] = useState([]);
  const [paginatedAlerts, setPaginatedAlerts] = useState([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [agentList, setAgentList] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const username = localStorage.getItem('soc_username') || 'User';
  const fullname = localStorage.getItem('soc_fullname') || 'Security Analyst';

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const getAllAlerts = async () => {
      const data = await fetchAllAlerts();
      if (!data) return;

      const fullAlerts = data.hits?.hits?.map((hit, index) => ({
        id: hit._source.id || index + 1,
        title: hit._source.rule?.description || 'No Title',
        description: hit._source.full_log || 'No Description',
        severity:
          hit._source.rule?.level >= 15
            ? 'critical'
            : hit._source.rule?.level >= 12
              ? 'high'
              : hit._source.rule?.level >= 7
                ? 'medium'
                : 'low',
        agentName: hit._source.agent?.name || 'Unknown Agent',
        time: hit._source.timestamp || 'N/A',
        rule: hit._source.rule || {},
        data: hit._source.data || {},
        decoder: hit._source.decoder || {},
        location: hit._source.location || 'N/A',
        agent: hit._source.agent || {},
        manager: hit._source.manager || {},
        input: hit._source.input || {},
        '@timestamp': hit._source['@timestamp'] || '',
        previous_output: hit._source.previous_output || '',
        previous_log: hit._source.previous_log || '',
      })) || [];

      setAllAlerts(fullAlerts);
      setTotalAlerts(data.hits?.total?.value || 0);

      const agentNames = [...new Set(fullAlerts.map((a) => a.agentName))];
      agentNames.sort();
      setAgentList(agentNames);
    };

    getAllAlerts();
  }, []);

  useEffect(() => {
    const getPageAlerts = async () => {
      setLoading(true);
      const from = (currentPage - 1) * pageSize;

      const data = await fetchPaginatedAlerts(from, pageSize);
      if (!data) {
        setLoading(false);
        return;
      }

      const pageData = data.hits?.hits?.map((hit, index) => ({
        id: hit._source.id || from + index + 1,
        title: hit._source.rule?.description || 'No Title',
        description: hit._source.full_log || 'No Description',
        severity:
          hit._source.rule?.level >= 15
            ? 'critical'
            : hit._source.rule?.level >= 12
              ? 'high'
              : hit._source.rule?.level >= 7
                ? 'medium'
                : 'low',
        agentName: hit._source.agent?.name || 'Unknown Agent',
        time: hit._source.timestamp || 'N/A',
        rule: hit._source.rule || {},
        data: hit._source.data || {},
        decoder: hit._source.decoder || {},
        location: hit._source.location || 'N/A',
        agent: hit._source.agent || {},
        manager: hit._source.manager || {},
        input: hit._source.input || {},
        '@timestamp': hit._source['@timestamp'] || '',
        previous_output: hit._source.previous_output || '',
        previous_log: hit._source.previous_log || '',
      })) || [];

      setPaginatedAlerts(pageData);
      setLoading(false);
    };

    getPageAlerts();
  }, [currentPage, pageSize]);

  const filteredAlerts = allAlerts.filter((a) => {
    const agentMatch = selectedAgent === 'All' || a.agentName === selectedAgent;
    const severityMatch = selectedSeverity === 'All' || a.severity === selectedSeverity;
    return agentMatch && severityMatch;
  });

  const paginatedFilteredAlerts = filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize);
  // Calculate severity counts from the full allAlerts array for summary boxes
  const summarySeverityCounts = allAlerts.reduce(
    (acc, alert) => {
      const level = alert.rule?.level ?? alert.level ?? 0;
      if (level >= 15) acc.critical++;
      else if (level >= 12) acc.high++;
      else if (level >= 7) acc.medium++;
      else acc.low++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  const chartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Alert Count',
        data: [
          summarySeverityCounts.critical,
          summarySeverityCounts.high,
          summarySeverityCounts.medium,
          summarySeverityCounts.low,
        ],
        backgroundColor: [
          'rgba(231, 70, 148, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(34, 197, 94, 0.6)',
        ],
        borderColor: [
          'rgba(231, 70, 148, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          summarySeverityCounts.critical,
          summarySeverityCounts.high,
          summarySeverityCounts.medium,
          summarySeverityCounts.low,
        ],
        backgroundColor: [
          'rgba(231, 70, 148, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(34, 197, 94, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true, precision: 0 } },
    maintainAspectRatio: false,
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Loading alerts...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar username={username} fullname={fullname} />

      <div className="w-full overflow-y-auto p-6 max-w-7xl mx-auto mt-20 scrollbar-hide">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" />
          Security Alerts
        </h2>

        {/* Severity Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {['critical', 'high', 'medium', 'low'].map((level) => {
            const color = {
              critical: 'text-pink-600 border-pink-400',
              high: 'text-red-600 border-red-400',
              medium: 'text-yellow-600 border-yellow-400',
              low: 'text-green-600 border-green-400',
            }[level];
            const isSelected = selectedSeverity === level;
            return (
              <button
                key={level}
                onClick={() => setSelectedSeverity(isSelected ? 'All' : level)}
                className={`rounded-lg shadow-sm p-4 border ${color} bg-white text-center transition-all duration-200 ease-in-out transform hover:scale-105 focus:scale-105 active:scale-100 ${isSelected ? 'ring-2 ring-black bg-gray-100 scale-105' : 'ring-0'}`}
                style={{ outline: 'none' }}
              >
                <div className="text-sm capitalize font-semibold">{level} Severity</div>
                <div className="text-3xl font-bold">{summarySeverityCounts[level]}</div>
              </button>
            );
          })}
        </div>
        {/* Clear Severity Filter Button */}
        {selectedSeverity !== 'All' && (
          <button
            onClick={() => setSelectedSeverity('All')}
            className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Severity Filter
          </button>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Vulnerability Detection by Severity
            </h3>
            <div className="h-72">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Alert Distribution
            </h3>
            <div className="w-60 md:w-72">
              <Doughnut data={doughnutData} />
            </div>
          </div>
        </div>

        {/* Alert Table */}
        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Alert Details</h3>
          </div>

          {/* Agent Filter */}
          <div className="mb-4 flex items-center gap-3">
            <label className="font-semibold text-gray-700">Filter by Agent:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="All">All</option>
              {agentList.map((agent) => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-y-auto max-h-[450px] scrollbar-hide">
            <table className="min-w-full table-auto text-sm text-left border border-gray-200">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="p-2 border border-gray-200">#</th>
                  <th className="p-2 border border-gray-200">Title</th>
                  <th className="p-2 border border-gray-200">Severity</th>
                  <th className="p-2 border border-gray-200">Agent Name</th>
                  <th className="p-2 border border-gray-200">Time</th>
                  <th className="p-2 border border-gray-200">Description</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFilteredAlerts.map((alert, idx) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <td className="p-2 border border-gray-200">{alert.id}</td>
                    <td className="p-2 border border-gray-200 font-medium text-gray-800">{alert.title}</td>
                    <td className={`p-2 border border-gray-200 capitalize font-semibold text-${alert.severity === 'critical' ? 'pink' : alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'yellow' : 'green'}-600`}>
                      {alert.severity}
                    </td>
                    <td className="p-2 border border-gray-200">{alert.agentName}</td>
                    <td className="p-2 border border-gray-200">{alert.time}</td>
                    <td className="p-2 border border-gray-200">{alert.description.slice(0, 80)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Rows per page:{' '}
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="ml-2 p-1 border rounded"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      {selectedAlert && (<AlertDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />)}
      

    </div>
  );
};

export default Alerts;