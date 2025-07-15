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
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Shield,
  ShieldOff,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
  Info
} from 'lucide-react';
import Navbar from './Navbar';
import { fetchAllAlerts, fetchPaginatedAlerts, fetchAssignedAgents } from '../../services/SOCservices';
import AlertDetail from './AlertDetail';
import axios from 'axios';

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
  const [showFilters, setShowFilters] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');
  const [assignedAgentNames, setAssignedAgentNames] = useState([]);
  const [assignedAgentIds, setAssignedAgentIds] = useState([]);
  const [assignedAgents, setAssignedAgents] = useState([]);

  const username = localStorage.getItem('soc_username') || 'User';
  const fullname = localStorage.getItem('soc_fullname') || 'Security Analyst';

  // Severity configuration
  const severityConfig = {
    critical: {
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      icon: <ShieldAlert className="w-5 h-5 text-pink-500" />,
      level: 15
    },
    high: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      level: 12
    },
    medium: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Shield className="w-5 h-5 text-amber-500" />,
      level: 7
    },
    low: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      level: 0
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const getAllAlerts = async () => {
      try {
        setLoading(true);
        const data = await fetchAllAlerts();
        if (!data) return;

        const fullAlerts = data.hits?.hits?.map((hit, index) => ({
          id: hit._source.id || index + 1,
          title: hit._source.rule?.description || 'No Title',
          description: hit._source.full_log || 'No Description',
          severity:
            hit._source.rule?.level >= severityConfig.critical.level
              ? 'critical'
              : hit._source.rule?.level >= severityConfig.high.level
                ? 'high'
                : hit._source.rule?.level >= severityConfig.medium.level
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
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    getAllAlerts();
  }, []);

  useEffect(() => {
    const getPageAlerts = async () => {
      try {
        setLoading(true);
        const from = (currentPage - 1) * pageSize;

        const data = await fetchPaginatedAlerts(from, pageSize);
        if (!data) return;

        const pageData = data.hits?.hits?.map((hit, index) => ({
          id: hit._source.id || from + index + 1,
          title: hit._source.rule?.description || 'No Title',
          description: hit._source.full_log || 'No Description',
          severity:
            hit._source.rule?.level >= severityConfig.critical.level
              ? 'critical'
              : hit._source.rule?.level >= severityConfig.high.level
                ? 'high'
                : hit._source.rule?.level >= severityConfig.medium.level
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
      } catch (error) {
        console.error('Error fetching paginated alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    getPageAlerts();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const fetchAgentsForFilter = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      setUserRole(role);
      if (role === 'admin') {
        // Admin: fetch all agents
        const res = await axios.get('/api/wazuh/agents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allAgents = res.data.data.affected_items || [];
        setAssignedAgents(allAgents);
      } else {
        // Regular user: fetch only assigned agents
        const userEmail = localStorage.getItem('soc_email');
        if (!userEmail) {
          setAssignedAgents([]);
          return;
        }
        const assignedAgentsArr = await fetchAssignedAgents(userEmail, token);
        setAssignedAgents(assignedAgentsArr);
      }
    };
    fetchAgentsForFilter();
  }, []);

  // Filter alerts based on agent assignment (for non-admin)
  const filteredAlerts = allAlerts.filter((a) => {
    const agentMatch = selectedAgent === 'All' || a.agent?.name === selectedAgent || a.agent?.agentName === selectedAgent;
    const alertSeverity = (a.severity || '').toLowerCase();
    const selectedSeverityLower = (selectedSeverity || '').toLowerCase();
    const severityMatch = selectedSeverity === 'All' || alertSeverity === selectedSeverityLower;

    if (userRole === 'admin') {
      return agentMatch && severityMatch;
    } else {
      if (selectedAgent === 'All') {
        // Only show assigned agents
        const assignedAgentNames = assignedAgents.map(a => a.agentName || a.name);
        const isAssigned = assignedAgentNames.includes(a.agent?.name) || assignedAgentNames.includes(a.agent?.agentName);
        return agentMatch && severityMatch && isAssigned;
      } else {
        // If a specific agent is selected, it's already assigned (from dropdown)
        return agentMatch && severityMatch;
      }
    }
  });

  const paginatedFilteredAlerts = filteredAlerts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredAlerts.length / pageSize);

  // Calculate severity counts from the filtered alerts array for summary boxes
  const summarySeverityCounts = filteredAlerts.reduce(
    (acc, alert) => {
      const level = alert.rule?.level ?? alert.level ?? 0;
      if (level >= severityConfig.critical.level) acc.critical++;
      else if (level >= severityConfig.high.level) acc.high++;
      else if (level >= severityConfig.medium.level) acc.medium++;
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
          'rgba(236, 72, 153, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgba(236, 72, 153, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(16, 185, 129, 1)',
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
          'rgba(236, 72, 153, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    maintainAspectRatio: false,
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  // Loader component for charts
  const ChartLoader = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mb-4"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Navbar username={username} fullname={fullname} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar username={username} fullname={fullname} />

      <div className="flex-1 overflow-y-auto p-6 mx-40 pt-24 scrollbar-hide">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={24} />
              Security Alerts Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredAlerts.length.toLocaleString()} total alerts detected
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} transition-colors`}
          >
            {showFilters ? (
              <>
                <X size={18} />
                <span>Hide Filters</span>
              </>
            ) : (
              <>
                <Filter size={18} />
                <span>Show Filters</span>
              </>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Severity
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(severityConfig).map(([severity, config]) => (
                    <button
                      key={severity}
                      onClick={() => setSelectedSeverity(selectedSeverity === severity ? 'All' : severity)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border transition-all ${selectedSeverity === severity ? `${config.color} border-gray-300 shadow-inner` : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {config.icon}
                      <span className="capitalize">{severity}</span>
                      {selectedSeverity === severity && (
                        <span className="ml-1">({summarySeverityCounts[severity]})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Agent
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  disabled={assignedAgents.length === 0}
                >
                  {assignedAgents.length === 0 ? (
                    <option disabled>No agents available</option>
                  ) : (
                    <>
                      <option value="All">All Agents</option>
                      {assignedAgents.map((agent) => (
                        <option key={agent.agentName || agent.name} value={agent.agentName || agent.name}>
                          {agent.agentName || agent.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Severity Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(severityConfig).map(([severity, config]) => (
            <div
              key={severity}
              className={`rounded-xl border ${config.color} p-4 transition-all hover:shadow-md cursor-pointer ${selectedSeverity === severity ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedSeverity(selectedSeverity === severity ? 'All' : severity)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <span className="text-sm font-medium capitalize">{severity}</span>
                </div>
                {selectedSeverity === severity && (
                  <X className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="text-2xl font-bold mt-2">
                {summarySeverityCounts[severity].toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((summarySeverityCounts[severity] / filteredAlerts.length) * 100)}% of total
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="relative">
          {/* Loader overlay for the whole chart section */}
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
              <div className="animate-spin rounded-full h-16 w-16 border-8 border-primary border-t-transparent"></div>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-opacity ${loading ? 'opacity-30 pointer-events-none' : ''}`}>
            {/* Alert Distribution by Severity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <List size={18} className="text-blue-500" />
                Alert Distribution by Severity
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Alert Severity Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                Alert Severity Breakdown
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Alert Details ({filteredAlerts.length.toLocaleString()} filtered)
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedFilteredAlerts.length > 0 ? (
                  paginatedFilteredAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {alert.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${severityConfig[alert.severity].color}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.agentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.time}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No alerts found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            {/* Mobile pagination */}
            <div className="flex-1 flex justify-between items-center sm:hidden">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-300'
                  }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 px-4">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-300'
                  }`}
              >
                Next
              </button>
            </div>

            {/* Desktop pagination */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, filteredAlerts.length)}</span> of{' '}
                  <span className="font-medium">{filteredAlerts.length}</span> alerts
                </p>
              </div>
              <div>
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    aria-label="First page"
                  >
                    <ChevronsLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      // Show ellipsis if needed
                      if (i === 0 && pageNum > 1) {
                        return (
                          <span key="start-ellipsis" className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }

                      if (i === 4 && pageNum < totalPages) {
                        return (
                          <span key="end-ellipsis" className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    aria-label="Last page"
                  >
                    <ChevronsRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <AlertDetail
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
};

export default Alerts;