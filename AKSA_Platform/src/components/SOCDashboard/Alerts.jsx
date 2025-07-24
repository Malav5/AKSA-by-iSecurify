import React, { useState, useEffect, useRef } from 'react';
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
import AlertsCharts from './Alerts/AlertsCharts';
import AlertsTable from './Alerts/AlertsTable';
import { Listbox } from '@headlessui/react';

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
  const agentListboxButtonRef = useRef(null);
  const [agentDropUp, setAgentDropUp] = useState(false);

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
      if (role === 'subadmin') {
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

  useEffect(() => {
    const handlePosition = () => {
      if (!agentListboxButtonRef.current) return;
      const rect = agentListboxButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setAgentDropUp(spaceBelow < 250 && spaceAbove > 250);
    };
    handlePosition();
    window.addEventListener('resize', handlePosition);
    window.addEventListener('scroll', handlePosition, true);
    return () => {
      window.removeEventListener('resize', handlePosition);
      window.removeEventListener('scroll', handlePosition, true);
    };
  }, []);

  // Filter alerts based on agent assignment (for non-admin)
  const filteredAlerts = allAlerts.filter((a) => {
    const agentMatch = selectedAgent === 'All' || a.agent?.name === selectedAgent || a.agent?.agentName === selectedAgent;
    const alertSeverity = (a.severity || '').toLowerCase();
    const selectedSeverityLower = (selectedSeverity || '').toLowerCase();
    const severityMatch = selectedSeverity === 'All' || alertSeverity === selectedSeverityLower;

    if (userRole === 'subadmin') {
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
    hover: {
      mode: 'nearest',
      intersect: true,
      animationDuration: 400,
      onHover: function (e, activeEls) {
        if (e.native) {
          e.native.target.style.cursor = activeEls.length ? 'pointer' : 'default';
        }
      }
    },
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
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
    elements: {
      bar: {
        borderWidth: 1,
        hoverBorderWidth: 4,
        backgroundColor: [
          'rgba(236, 72, 153, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        hoverBackgroundColor: [
          'rgba(236, 72, 153, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(16, 185, 129, 1)',
        ],
      }
    }
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
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 600,
      easing: 'easeOutQuart',
    },
    hoverOffset: 16,
    hoverBorderWidth: 4,
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
            <h2 className="text-2xl font-bold text-primary mt-4 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={24} />
              Security Alerts Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredAlerts.length.toLocaleString()} total alerts detected
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showFilters ? 'bg-secondary text-primary' : 'bg-gray-100 text-gray-700'} transition-colors`}
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
              {/* Agent Filter - Headless UI Listbox */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Agent
                </label>
                <Listbox value={selectedAgent} onChange={setSelectedAgent}>
                  <div className="relative w-full">
                    <Listbox.Button ref={agentListboxButtonRef} className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                      {selectedAgent}
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className={`absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base focus:outline-none sm:text-sm ${agentDropUp ? 'bottom-full mb-1' : 'mt-1'}`}>
                      <Listbox.Option value="All">
                        {({ selected }) => (
                          <span className={`block px-4 py-2 cursor-pointer ${selected ? 'font-semibold text-primary' : 'text-gray-900'}`}>All Agents</span>
                        )}
                      </Listbox.Option>
                      {assignedAgents.length === 0 ? (
                        <Listbox.Option value="" disabled>
                          <span className="block px-4 py-2 text-gray-400">No agents available</span>
                        </Listbox.Option>
                      ) : (
                        assignedAgents.map((agent) => (
                          <Listbox.Option key={agent.agentName || agent.name} value={agent.agentName || agent.name}>
                            {({ selected }) => (
                              <span className={`block px-4 py-2 cursor-pointer ${selected ? 'font-semibold text-primary' : 'text-gray-900'}`}>{agent.agentName || agent.name}</span>
                            )}
                          </Listbox.Option>
                        ))
                      )}
                    </Listbox.Options>
                  </div>
                </Listbox>
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
        <AlertsCharts
          chartData={chartData}
          doughnutData={doughnutData}
          chartOptions={chartOptions}
          doughnutOptions={doughnutOptions}
          loading={loading}
          filteredAlerts={filteredAlerts}
        />

        {/* Alerts Table */}
        <AlertsTable
          paginatedFilteredAlerts={paginatedFilteredAlerts}
          filteredAlerts={filteredAlerts}
          pageSize={pageSize}
          handlePageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          setSelectedAlert={setSelectedAlert}
          severityConfig={severityConfig}
        />
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