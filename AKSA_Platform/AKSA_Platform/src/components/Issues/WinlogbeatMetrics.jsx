import React, { useState, useEffect } from 'react';
import { getWinlogbeatStats } from '../../services/winlogbeatService';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, subHours, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TIME_FILTERS = [
  { label: 'Last Hour', value: '1h' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

const WinlogbeatMetrics = ({ deviceId }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('24h');

  useEffect(() => {
    loadMetrics();
  }, [timeFilter, deviceId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getWinlogbeatStats(timeFilter, deviceId);
      console.log('Raw metrics data:', stats); // Debug log
      setMetrics(stats);
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => ({
    labels: metrics?.timeSeries?.map(d => format(new Date(d.time), timeFilter === '1h' ? 'HH:mm' : 'MM/dd')) || [],
    datasets: [
      {
        label: 'Total Events',
        data: metrics?.timeSeries?.map(d => d.events) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Failed Logons',
        data: metrics?.timeSeries?.map(d => d.failedLogons) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      }
    ],
  });

  const getEventTypePieData = () => {
    if (!metrics?.eventTypes) return { labels: [], datasets: [{ data: [] }] };
    
    const topEventTypes = metrics.eventTypes.slice(0, 5);
    console.log('Event Types for pie chart:', topEventTypes); // Debug log
    
    return {
      labels: topEventTypes.map(type => type.key),
      datasets: [{
        data: topEventTypes.map(type => type.doc_count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Event Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Severity Distribution'
      }
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
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Metrics</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadMetrics}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Metrics Dashboard</h2>
        <div className="flex space-x-2">
          {TIME_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={`px-4 py-2 rounded-md ${
                timeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Authentication Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Failed Logons</h3>
          <p className="text-3xl font-bold text-red-600">{metrics?.failedLogons || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Last {timeFilter}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Monitored Devices</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics?.computers.length || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Active systems</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Event Types</h3>
          <p className="text-3xl font-bold text-green-600">{metrics?.eventTypes?.length || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Unique categories</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-purple-600">
            {metrics?.timeSeries?.reduce((sum, item) => sum + item.events, 0) || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Total events in {timeFilter}</p>
        </div>
      </div>

      {/* Event Trends Chart */}
      <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Event Trends</h3>
        <div style={{ height: '300px' }}>
          {metrics?.timeSeries && <Line data={getChartData()} options={chartOptions} />}
        </div>
      </div>

      
    </div>
  );
};

export default WinlogbeatMetrics; 