import React, { useState, useEffect } from "react";
import { Loader2, ChevronDown, Trash2 } from "lucide-react";
// Assuming axios is needed for fetchDeviceInfo if it's a real API call
import axios from "axios";

// Helper function to get user-specific localStorage keys
const getUserKey = (key) => {
  const currentUser = localStorage.getItem("currentUser");
  const userPrefix = currentUser ? currentUser.split('@')[0] : '';
  return `${userPrefix}_${key}`;
};

const DeviceManagement = () => {
  // State for managing devices
  const [devices, setDevices] = useState(() => {
    const savedDevices = localStorage.getItem(getUserKey("socDevices"));
    return savedDevices ? JSON.parse(savedDevices) : [];
  });
  const [newDevice, setNewDevice] = useState({
    name: '',
    ip: '',
    type: ''
  });
  const [selectedDeviceIP, setSelectedDeviceIP] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingDeviceInfo, setIsLoadingDeviceInfo] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [deviceInfoError, setDeviceInfoError] = useState(null);

  // Device types for dropdown
  const deviceTypes = [
    'Laptop',
    'PC',
    'Smartphone',     
    'Smart TV',
    'Server',
    'Network Device',
    'IoT Device',
    'Virtual Machine',
    'Other Electronic Device',
  ];

  // Sync devices to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(getUserKey("socDevices"), JSON.stringify(devices));
  }, [devices]);

  // Function to fetch device information (mock or real API)
  const fetchDeviceInfo = async (ip) => {
    setIsLoadingDeviceInfo(true);
    setDeviceInfoError(null);
    try {
      // Configuration object to toggle between real API and simulated data
      const config = {
        useRealApi: true, // Set to true to use real API, false for simulated
        wazuhApiUrl: process.env.REACT_APP_WAZUH_API_URL || 'YOUR_WAZUH_API_URL', // Use .env or replace
        wazuhApiUser: process.env.REACT_APP_WAZUH_API_USER || 'YOUR_WAZUH_API_USER', // Use .env or replace
        wazuhApiPassword: process.env.REACT_APP_WAZUH_API_PASSWORD || 'YOUR_WAZUH_API_PASSWORD', // Use .env or replace
      };

      const getWazuhToken = async () => {
        try {
          const response = await axios.post(`${config.wazuhApiUrl}/security/user/authenticate`, {
            username: config.wazuhApiUser,
            password: config.wazuhApiPassword
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
          return response.data.token;
        } catch (error) {
          console.error("Wazuh API Authentication Error:", error);
          throw new Error("Failed to authenticate with Wazuh API.");
        }
      };

      const getWazuhDeviceInfo = async (ip) => {
        const token = await getWazuhToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch agents by IP address
        const agentsResponse = await axios.get(`${config.wazuhApiUrl}/agents?ip=${ip}`, { headers });
        const agents = agentsResponse.data.data;

        if (agents.affected_items && agents.affected_items.length > 0) {
          const agent = agents.affected_items[0];
          // Fetch detailed agent information (e.g., OS, hardware)
          const sysInfoResponse = await axios.get(`${config.wazuhApiUrl}/agents/${agent.id}/sysinfo?pretty=true`, { headers });
          const sysInfo = sysInfoResponse.data.data.system_info;

          return {
            status: agent.status === 'active' ? 'online' : agent.status,
            hostname: agent.name,
            os: sysInfo.os.name || 'N/A',
            lastSeen: agent.lastKeepAlive,
            macAddress: agent.network_info.mac || 'N/A',
            manufacturer: sysInfo.board.vendor || 'N/A',
            model: sysInfo.board.name || 'N/A',
            agentId: agent.id
          };
        } else {
          throw new Error("No Wazuh agent found for this IP.");
        }
      };

      const getSimulatedDeviceInfo = async (ip) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              status: 'online',
              hostname: `simulated-device-${ip.split('.').join('-')}`,
              os: 'Windows 10',
              lastSeen: new Date().toISOString(),
              macAddress: '00:1A:2B:3C:4D:5E',
              manufacturer: 'Simulated Corp',
              model: 'Virtual Box'
            });
          }, 1000);
        });
      };

      let fetchedInfo;
      if (config.useRealApi) {
        fetchedInfo = await getWazuhDeviceInfo(ip);
      } else {
        fetchedInfo = await getSimulatedDeviceInfo(ip);
      }

      setDeviceInfo(fetchedInfo);
      // Auto-fill device name and type based on fetched information
      setNewDevice(prev => ({
        ...prev,
        name: fetchedInfo.hostname,
        type: determineDeviceType(fetchedInfo)
      }));
    } catch (error) {
      setDeviceInfoError(error.message || 'Failed to fetch device information');
      console.error('Error fetching device info:', error);
    } finally {
      setIsLoadingDeviceInfo(false);
    }
  };

  const determineDeviceType = (info) => {
    const os = info.os?.toLowerCase();
    const model = info.model?.toLowerCase();
    const hostname = info.hostname?.toLowerCase();

    if (os?.includes('windows') || os?.includes('linux') || os?.includes('mac')) {
      if (model?.includes('laptop') || hostname?.includes('laptop')) return 'Laptop';
      if (model?.includes('server') || hostname?.includes('server')) return 'Server';
      return 'PC';
    }
    if (os?.includes('android') || os?.includes('ios')) return 'Smartphone';
    if (model?.includes('tv')) return 'Smart TV';
    if (hostname?.includes('router') || hostname?.includes('switch') || model?.includes('router') || model?.includes('switch')) return 'Network Device';
    if (hostname?.includes('iot')) return 'IoT Device';
    if (hostname?.includes('vm')) return 'Virtual Machine';

    return 'Other Electronic Device';
  };

  // Function to validate IP address format
  const isValidIP = (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  };

  // Function to add a device
  const addDevice = () => {
    // Validation: check if IP is not empty and valid
    if (newDevice.ip.trim() === '' || !isValidIP(newDevice.ip)) {
      alert("Please enter a valid IP address.");
      return;
    }
    // Check if device with this IP already exists
    if (devices.some(device => device.ip === newDevice.ip)) {
      alert("A device with this IP address already exists.");
      return;
    }

    setDevices([...devices, {
      name: newDevice.name.trim() || `Device ${newDevice.ip}`, // Default name if not provided
      ip: newDevice.ip.trim(),
      type: newDevice.type || 'Other Electronic Device',
      info: deviceInfo // Include the fetched device information
    }]);
    // Reset form
    setNewDevice({
      name: '',
      ip: '',
      type: ''
    });
    setDeviceInfo(null);
  };

  // Function to remove a device
  const removeDevice = (ipToRemove) => {
    setDevices(devices.filter(device => device.ip !== ipToRemove));
    if (selectedDeviceIP === ipToRemove) {
      setSelectedDeviceIP(null); // Deselect if the removed device was selected
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2 text-primary">Device Management</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
            <input
              type="text"
              placeholder="Enter Device Name"
              value={newDevice.name}
              onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device IP *</label>
            <input
              type="text"
              placeholder="Enter Device IP"
              value={newDevice.ip}
              onChange={(e) => {
                const ip = e.target.value;
                setNewDevice({...newDevice, ip});
                if (isValidIP(ip)) {
                  fetchDeviceInfo(ip);
                } else {
                  setDeviceInfo(null);
                  setDeviceInfoError(null);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {isLoadingDeviceInfo && (
              <div className="mt-1 text-sm text-gray-500">
                <Loader2 className="inline w-4 h-4 mr-1 animate-spin" /> Fetching device information...
              </div>
            )}
            {deviceInfoError && (
              <div className="mt-1 text-sm text-red-500">
                {deviceInfoError}
              </div>
            )}
            {deviceInfo && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 ${deviceInfo.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                      {deviceInfo.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">OS:</span> {deviceInfo.os}
                  </div>
                  <div>
                    <span className="font-medium">Manufacturer:</span> {deviceInfo.manufacturer}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {deviceInfo.model}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <select
              value={newDevice.type}
              onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Type</option>
              {deviceTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={addDevice}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Add Device
          </button>
        </div>
      </div>
      {/* Placeholder for Devices Dropdown */}
      <div className="mt-4 relative">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Added Devices:</h3>
        <button
          className="w-full text-left p-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {selectedDeviceIP ? devices.find(d => d.ip === selectedDeviceIP)?.name || selectedDeviceIP : 'Select a Device'}
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {devices.length === 0 ? (
              <p className="p-2 text-gray-600">No devices added yet.</p>
            ) : (
              <ul>
                {devices.map((device, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-2 px-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <span
                      className="text-gray-700 flex-grow"
                      onClick={() => {
                        setSelectedDeviceIP(device.ip);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-gray-500">
                          {device.ip} - {device.type}
                          {device.info && (
                            <span className={`ml-2 ${device.info.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                              • {device.info.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent closing dropdown when removing
                        removeDevice(device.ip);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement; 