const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const wazuhRoutes = require('./routes/wazuh');
const memberRoutes = require("./routes/members");
const taskRoutes = require('./routes/taskRoutes');
const agentMapRoutes = require('./routes/agentMap');
const cron = require('node-cron');
const Agent = require('./models/Agent');
const axios = require('axios');
const https = require('https');
const { getWazuhToken } = require('./wazuh/tokenService');
const apiBaseUrl = process.env.WAZUH_API_URL;
const issueRoutes = require("./routes/issues");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Function to sync Wazuh agents to MongoDB
async function syncWazuhAgents() {
  try {
    const token = await getWazuhToken();
    const response = await axios.get(`${apiBaseUrl}/agents`, {
      headers: { Authorization: `Bearer ${token}` },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    const wazuhAgents = response.data.data.affected_items || [];
    for (const agent of wazuhAgents) {
      const mapped = {
        agentName: agent.name,
        agentId: Number(agent.id),
        agentIp: agent.ip || (agent.registerIP || ""),
        status: agent.status,
        hostname: agent.name,
        lastSeen: agent.lastKeepAlive ? new Date(agent.lastKeepAlive) : undefined,
        createdAt: agent.dateAdd ? new Date(agent.dateAdd) : undefined,
      };
      await Agent.findOneAndUpdate(
        { agentId: mapped.agentId },
        mapped,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Wazuh Sync] Synced ${wazuhAgents.length} agents at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[Wazuh Sync] Failed to sync agents:', err.message);
  }
}

// Schedule sync every 30 seconds
cron.schedule('*/30 * * * * *', syncWazuhAgents);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/domains", require("./routes/domains"));
app.use('/api/wazuh', wazuhRoutes);
app.use("/api/member", memberRoutes);
app.use('/api', taskRoutes);
app.use('/api/agentMap', agentMapRoutes);
app.use("/api/issues", issueRoutes);

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
