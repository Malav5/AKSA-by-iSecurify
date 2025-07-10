const axios = require('axios');

// Replace with your credentials
const username = 'wazuh-wui';
const password = 'wazuh-wui';

const authUrl = 'https://192.168.1.150:55000/security/user/authenticate?raw=true';

// Step 1: Get the token
axios.post(authUrl, null, {
  auth: {
    username,
    password
  },
  httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
})
.then(authResponse => {
  const token = authResponse.data;
  console.log("✅ Token received:", token);

  // Step 2: Use the token in another request (example: get agents)
  return axios.get('https://192.168.1.150:55000/agents', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
  });
})
.then(dataResponse => {
  console.log("✅ Agent data:", dataResponse.data);
})
.catch(error => {
  console.error("❌ Error:", error.response ? error.response.data : error.message);
});
