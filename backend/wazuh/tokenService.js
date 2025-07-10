// backend/wazuh/tokenService.js
const axios = require("axios");
const https = require("https");
require("dotenv").config();

const username = process.env.WAZUH_USERNAME;
const password = process.env.WAZUH_PASSWORD;
const apiBaseUrl = process.env.WAZUH_API_URL;
const authUrl = `${apiBaseUrl}/security/user/authenticate?raw=true`;

async function getWazuhToken() {
  try {
    const response = await axios.post(authUrl, null, {
      auth: {
        username,
        password
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    // console.log("✅ Token received:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Token fetch failed:", error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { getWazuhToken };
