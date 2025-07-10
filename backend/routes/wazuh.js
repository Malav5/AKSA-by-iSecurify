// backend/routes/wazuh.js
const express = require("express");
const axios = require("axios");
const https = require("https");
const router = express.Router();
require("dotenv").config();

const { getWazuhToken } = require("../wazuh/tokenService");
const apiBaseUrl = process.env.WAZUH_API_URL;

router.get("/agents", async (req, res) => {
  try {
    const token = await getWazuhToken();

    const response = await axios.get(`${apiBaseUrl}/agents`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    console.log("✅ Agent data:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error("❌ Error fetching Wazuh agents:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/agent-detail/:agentId', async (req, res) => {
  const { agentId } = req.params;

  try {
    const token = await getWazuhToken();

    // Added 'processes' endpoint with limit=50
    const endpoints = ['hardware', 'hotfixes', 'netaddr', 'os', 'packages', 'ports', 'processes'];
    const results = {};

    for (const endpoint of endpoints) {
      // Add limit=50 query param for certain endpoints
      const query = ['packages', 'ports', 'processes'].includes(endpoint) ? '?limit=30' : '';
      const url = `${apiBaseUrl}/syscollector/${agentId}/${endpoint}${query}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      results[endpoint] = response.data?.data?.affected_items ?? [];
    }

    res.json({ agentId, ...results });
  } catch (err) {
    console.error(`❌ Error fetching agent info (${agentId}):`, err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to retrieve agent information',
      message: err.message,
    });
  }
});

router.post('/add-agent', async (req, res) => {
  const { name, ip } = req.body;

  if (!name || !ip) {
    return res.status(400).json({ error: 'Name and IP are required' });
  }

  try {
    const token = await getWazuhToken();

    const response = await axios.post(
      `${apiBaseUrl}/agents?pretty=true&wait_for_complete=true`,
      { name, ip },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );

    console.log("✅ New agent created:", response.data);
    res.status(201).json({ message: 'Agent created successfully', data: response.data });

  } catch (error) {
    console.error("❌ Error adding Wazuh agent:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to add agent',
      details: error.response?.data || error.message
    });
  }
});

router.delete("/delete-agent", async (req, res) => {
  const {
    agentIds = [],
    status = "all",
    purge = true,
    older_than = "0s",
    pretty = true,
    wait_for_complete = true,
  } = req.body;

  if (!Array.isArray(agentIds) || agentIds.length === 0) {
    return res.status(400).json({ error: "agentIds array is required in the request body." });
  }

  try {
    const token = await getWazuhToken();

    const agentsList = agentIds.join(",");

    const queryParams = new URLSearchParams({
      agents_list: agentsList,
      status,
      purge: purge.toString(),
      older_than,
      pretty: pretty.toString(),
      wait_for_complete: wait_for_complete.toString(),
    });

    const url = `${apiBaseUrl}/agents?${queryParams.toString()}`;

    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    console.log("✅ Agent(s) deleted:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Error deleting agents:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

const ELASTICSEARCH_URL = 'https://192.168.1.198:9200';
const AUTH = {
  username: 'admin',
  password: 'admin'
};
const HEADERS = {
  'Content-Type': 'application/json'
};
const HTTPS_AGENT = new https.Agent({ rejectUnauthorized: false });

router.post('/alerts', async (req, res) => {
  try {
    const response = await axios.post(
      `${ELASTICSEARCH_URL}/wazuh-alerts-*/_search`,
      req.body,
      {
        headers: HEADERS,
        auth: AUTH,
        httpsAgent: HTTPS_AGENT
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Error fetching alerts from Elasticsearch:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch alerts',
      details: error.response?.data || error.message
    });
  }
});

router.post('/vulnerabilities', async (req, res) => {
  try {
    const response = await axios.post(
      `${ELASTICSEARCH_URL}/wazuh-states-vulnerabilities-*/_search`,
      req.body,
      {
        headers: HEADERS,
        auth: AUTH,
        httpsAgent: HTTPS_AGENT
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Error fetching vulnerabilities:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch vulnerabilities',
      details: error.response?.data || error.message
    });
  }
});

router.get('/alert-severity-chart', async (req, res) => {
  try {
    const response = await axios.post(
      `${ELASTICSEARCH_URL}/wazuh-alerts-*/_search`,
      {
        size: 0,
        aggs: {
          severity_levels: {
            terms: {
              field: 'rule.level',
              size: 20
            }
          }
        }
      },
      {
        headers: HEADERS,
        auth: AUTH,
        httpsAgent: HTTPS_AGENT
      }
    );

    const buckets = response.data.aggregations.severity_levels.buckets;

    const chartData = {
      labels: buckets.map(bucket => `Level ${bucket.key}`),
      datasets: [
        {
          label: 'Number of Alerts',
          data: buckets.map(bucket => bucket.doc_count),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };

    res.status(200).json(chartData);
  } catch (error) {
    console.error("❌ Error generating severity-level chart:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch severity-level chart data',
      details: error.response?.data || error.message
    });
  }
});


// GET /api/wazuh/mitre-data
router.get('/mitre-data', async (req, res) => {
  const token = await getWazuhToken();
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    const [groups, mitigations, software, references, tactics, techniques] = await Promise.all([
      axios.get(`${apiBaseUrl}/mitre/groups?pretty=true`, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent }),
      axios.get(`${apiBaseUrl}/mitre/mitigations?pretty=true`, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent }),
      axios.get(`${apiBaseUrl}/mitre/software?pretty=true&limit=100`, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent }),
      axios.get(`${apiBaseUrl}/mitre/references?pretty=true`, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent }),
      axios.get(`${apiBaseUrl}/mitre/tactics?pretty=true`, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent }),
      axios.get(`${apiBaseUrl}/mitre/techniques?pretty=true&limit=100`, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent }),
    ]);

    res.json({
      groups: groups.data.data.affected_items,
      mitigations: mitigations.data.data.affected_items,
      software: software.data.data.affected_items,
      references: references.data.data.affected_items,
      tactics: tactics.data.data.affected_items,
      techniques: techniques.data.data.affected_items
    });
  } catch (error) {
    console.error('❌ MITRE data fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch MITRE data', details: error.message });
  }
});

// === FIM Scan & Syscheck Routes ===
// Run FIM scan on all agents
router.put('/syscheck', async (req, res) => {
  try {
    const token = await getWazuhToken();
    const response = await axios.put(
      `${apiBaseUrl}/syscheck`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Error running FIM scan:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Get FIM findings for a specific agent
router.get('/syscheck/:agent_id', async (req, res) => {
  const { agent_id } = req.params;
  try {
    const token = await getWazuhToken();
    const response = await axios.get(
      `${apiBaseUrl}/syscheck/${agent_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Error getting FIM results:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Clear FIM scan results for a specific agent
router.delete('/syscheck/:agent_id', async (req, res) => {
  const { agent_id } = req.params;
  try {
    const token = await getWazuhToken();
    const response = await axios.delete(
      `${apiBaseUrl}/syscheck/${agent_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Error clearing FIM results:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Get last scan datetime for a specific agent
router.get('/syscheck/:agent_id/last_scan', async (req, res) => {
  const { agent_id } = req.params;
  try {
    const token = await getWazuhToken();
    const response = await axios.get(
      `${apiBaseUrl}/syscheck/${agent_id}/last_scan`,
      {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Error getting last scan datetime:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
