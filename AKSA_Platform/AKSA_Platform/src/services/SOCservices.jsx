import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/wazuh';

// Fetch all vulnerabilities
export const fetchVulnerabilities = async () => {
  try {
    const query = {
      size: 10000,
      query: { match_all: {} },
    };

    const response = await axios.post(`${BASE_URL}/vulnerabilities`, query);
    return response.data?.hits?.hits ?? [];
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    throw error;
  }
};

// Fetch all alerts (up to 10,000)
export const fetchAllAlerts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 0,
        size: 10000,
        query: { match_all: {} },
        sort: [{ timestamp: { order: 'desc' } }],
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error in fetchAllAlerts:', err);
    return null;
  }
};

// Fetch paginated alerts
export const fetchPaginatedAlerts = async (from, size) => {
  try {
    const res = await fetch(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        size,
        query: { match_all: {} },
        sort: [{ timestamp: { order: 'desc' } }],
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error in fetchPaginatedAlerts:', err);
    return null;
  }
};

//  Fetch alert severity aggregation data
export const fetchAlertSeverityChartData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/alert-severity-chart`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching alert severity chart data:", error);
      throw error;
    }
  };
  
  //  Fetch alerts over time (histogram)
  export const fetchAlertsOverTimeData = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/alerts`, {
        size: 0,
        aggs: {
          alerts_over_time: {
            date_histogram: {
              field: "@timestamp",
              calendar_interval: "day",
              format: "yyyy-MM-dd"
            }
          }
        }
      });
      return response.data.aggregations?.alerts_over_time?.buckets || [];
    } catch (error) {
      console.error("❌ Error fetching alerts over time data:", error);
      throw error;
    }
  };
  // Fetch agent alert count aggregation
  export const fetchAgentAlertCounts = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/alerts`, {
        size: 0,
        aggs: {
          agents: {
            terms: {
              field: "agent.name"
            }
          }
        }
      });
      return response.data.aggregations?.agents?.buckets || [];
    } catch (error) {
      console.error("❌ Error fetching agent alert counts:", error);
      throw error;
    }
  };

  export const fetchLatestAlerts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 0,
          size: 5,
          query: { match_all: {} },
          sort: [{ timestamp: { order: "desc" } }]
        })
      });
  
      const data = await response.json();
      return data.hits?.hits?.map(hit => hit._source) || [];
    } catch (error) {
      console.error("❌ Error fetching latest alerts:", error);
      return [];
    }
  };
  
  export const fetchSeverityChartData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/alert-severity-chart`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error fetching severity chart data:", error);
      return null;
    }
  };
  

export const getComplianceStatus = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/alerts`, {
        size: 1000,
        query: {
          match_all: {}
        }
      });
      const alerts = response.data.hits?.hits || [];
      // Debug: log alert count and high severity count
      const highSeverity = alerts.filter(alert => (alert._source?.rule?.level || 0) >= 10).length;
      console.log(`[Compliance Debug] Total alerts: ${alerts.length}, High severity: ${highSeverity}`);
      return alerts;
    } catch (error) {
      console.error('❌ Failed to fetch Wazuh alerts:', error);
      throw error;
    }
  };

// === FIM Scan & Syscheck Services ===
// Run FIM scan on all agents
export const runFimScan = async () => {
  try {
    const response = await axios.put(`${BASE_URL}/syscheck`);
    return response.data;
  } catch (error) {
    console.error('Error running FIM scan:', error);
    throw error;
  }
};

// Get FIM findings for a specific agent
export const getFimResults = async (agentId) => {
  try {
    const response = await axios.get(`${BASE_URL}/syscheck/${agentId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting FIM results:', error);
    throw error;
  }
};

// Clear FIM scan results for a specific agent
export const clearFimResults = async (agentId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/syscheck/${agentId}`);
    return response.data;
  } catch (error) {
    console.error('Error clearing FIM results:', error);
    throw error;
  }
};

// Get last scan datetime for a specific agent
export const getLastFimScanDatetime = async (agentId) => {
  try {
    const response = await axios.get(`${BASE_URL}/syscheck/${agentId}/last_scan`);
    return response.data;
  } catch (error) {
    console.error('Error getting last scan datetime:', error);
    throw error;
  }
};

// Fetch all agents (admin) or only assigned agents (user)
export const fetchAgents = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/agents`);
    return response.data?.agents || [];
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Assign agent to user (admin only)
export const assignAgent = async (agentId, userId) => {
  try {
    const response = await axios.patch(`/api/agents/${agentId}/assign`, { user_id: userId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error assigning agent:', error);
    throw error;
  }
};

// Fetch all users (admin only)
export const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/users', { withCredentials: true });
    return response.data?.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// (Optional) Remove or comment out fetchUserAgentNames if not needed
// export const fetchUserAgentNames = async (userEmail) => {
//   const response = await axios.get(`/api/user-agents`, { params: { userEmail } });
//   return response.data.agents.map(a => a.agentName);
// };

export const fetchMitreData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/mitre-data`);
    if (!response.ok) throw new Error('Failed to fetch MITRE data');
    return await response.json();
  } catch (err) {
    console.error('Error in fetchMitreData:', err);
    throw err;
  }
};

// Fetch assigned agents for a user by email
export const fetchAssignedAgents = async (userEmail, token) => {
  try {
    const response = await axios.get(`/api/agentMap/assigned-agents-details?userEmail=${encodeURIComponent(userEmail)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.agents || [];
  } catch (error) {
    console.error('Error fetching assigned agents:', error);
    return [];
  }
};