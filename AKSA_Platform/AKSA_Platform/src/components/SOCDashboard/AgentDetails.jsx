import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const AgentDetails = ({ agentId, onBack }) => {
  const [hardware, setHardware] = useState([]);
  const [hotfixes, setHotfixes] = useState([]);
  const [netaddr, setNetaddr] = useState([]);
  const [osInfo, setOsInfo] = useState([]);
  const [packages, setPackages] = useState([]);
  const [ports, setPorts] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    osInfo: false,
    hardware: false,
    hotfixes: false,
    netaddr: false,
    ports: false,
    packages: false,
    processes: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/wazuh/agent-detail/${agentId}`);
        setHardware(res.data.hardware || []);
        setHotfixes(res.data.hotfixes || []);
        setNetaddr(res.data.netaddr || []);
        setOsInfo(res.data.os || []);
        setPackages(res.data.packages || []);
        setPorts(res.data.ports || []);
        setProcesses(res.data.processes || []);
      } catch (err) {
        console.error("Error loading agent details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [agentId]);

  if (loading) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
          <Navbar />
        </div>
        <div className="flex items-center justify-center h-screen bg-gray-50 pt-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border border-gray-200-4 border border-gray-200-blue-500 border border-gray-200-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm">Fetching agent details...</p>
          </div>
        </div>
      </>
    );
  }

  const SectionHeader = ({ title, sectionKey }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full text-left py-2 px-4 bg-gray-200 rounded-lg mb-2 font-semibold hover:bg-gray-300 flex justify-between items-center"
    >
      {title}
      <span>{openSections[sectionKey] ? '▲' : '▼'}</span>
    </button>
  );

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <Navbar />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg my-20 max-w-7xl mx-auto pt-24">
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onBack}
        >
          ← Back
        </button>

        <h2 className="text-xl font-bold mb-6">Agent ID: {agentId}</h2>

        {/* Sections */}
        <SectionHeader title="Operating System" sectionKey="osInfo" />
        {openSections.osInfo && (
          <div className="mb-10">
            {osInfo.length === 0 ? (
              <p className="text-gray-600">No OS info available.</p>
            ) : (
              osInfo.map((os, index) => (
                <div key={index} className="p-4 mb-4 bg-gray-50 rounded-lg shadow">
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Hostname:</strong> {os.hostname}</li>
                    <li><strong>OS Name:</strong> {os.os?.name}</li>
                    <li><strong>Version:</strong> {os.os?.version}</li>
                    <li><strong>Build:</strong> {os.os?.build}</li>
                    <li><strong>Display Version:</strong> {os.os?.display_version}</li>
                    <li><strong>Architecture:</strong> {os.architecture}</li>
                    <li><strong>Release:</strong> {os.os_release}</li>
                    <li><strong>Scan Time:</strong> {new Date(os.scan?.time).toLocaleString()}</li>
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        <SectionHeader title="Hardware Information" sectionKey="hardware" />
        {openSections.hardware && (
          <div className="mb-10">
            {hardware.length === 0 ? (
              <p className="text-gray-600">No hardware info available.</p>
            ) : (
              hardware.map((item, index) => (
                <div key={index} className="mb-6 p-4 rounded-lg bg-gray-50 shadow">
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>CPU Name:</strong> {item.cpu?.name || 'N/A'}</li>
                    <li><strong>CPU Cores:</strong> {item.cpu?.cores || 'N/A'}</li>
                    <li><strong>CPU MHz:</strong> {item.cpu?.mhz || 'N/A'}</li>
                    <li><strong>RAM Total:</strong> {item.ram?.total} MB</li>
                    <li><strong>RAM Free:</strong> {item.ram?.free} MB</li>
                    <li><strong>RAM Usage:</strong> {item.ram?.usage}%</li>
                    <li><strong>Board Serial:</strong> {item.board_serial || 'N/A'}</li>
                    <li><strong>Scan Time:</strong> {new Date(item.scan?.time).toLocaleString()}</li>
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        <SectionHeader title="Hotfixes" sectionKey="hotfixes" />
        {openSections.hotfixes && (
          <div className="mb-10">
            {hotfixes.length === 0 ? (
              <p className="text-gray-600">No hotfix info available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hotfixes.map((fix, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg shadow-sm">
                    <p><strong>Hotfix:</strong> {fix.hotfix}</p>
                    <p><strong>Scan Time:</strong> {new Date(fix.scan_time).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Network Addresses" sectionKey="netaddr" />
        {openSections.netaddr && (
          <div className="mb-10">
            {netaddr.length === 0 ? (
              <p className="text-gray-600">No network info available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {netaddr.map((net, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg shadow-sm">
                    <p><strong>Protocol:</strong> {net.proto}</p>
                    <p><strong>Interface:</strong> {net.iface}</p>
                    <p><strong>Address:</strong> {net.address}</p>
                    <p><strong>Netmask:</strong> {net.netmask || 'N/A'}</p>
                    <p><strong>Broadcast:</strong> {net.broadcast?.trim() || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Open Ports" sectionKey="ports" />
        {openSections.ports && (
          <div className="mb-10 overflow-x-auto">
            {ports.length === 0 ? (
              <p className="text-gray-600">No ports info available.</p>
            ) : (
              <table className="min-w-full border border-gray-200 border border-gray-200-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border border-gray-200">Local IP</th>
                    <th className="px-4 py-2 border border-gray-200">Local Port</th>
                    <th className="px-4 py-2 border border-gray-200">Remote IP</th>
                    <th className="px-4 py-2 border border-gray-200">Remote Port</th>
                    <th className="px-4 py-2 border border-gray-200">Protocol</th>
                    <th className="px-4 py-2 border border-gray-200">Process</th>
                    <th className="px-4 py-2 border border-gray-200">PID</th>
                    <th className="px-4 py-2 border border-gray-200">State</th>
                    <th className="px-4 py-2 border border-gray-200">Scan Time</th>
                  </tr>
                </thead>
                <tbody>
                  {ports.map((port, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-200">{port.local?.ip || 'N/A'}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.local?.port || 'N/A'}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.remote?.ip || 'N/A'}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.remote?.port || 'N/A'}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.protocol}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.process || 'N/A'}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.pid}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.state || 'N/A'}</td>
                      <td className="px-4 py-2 border border-gray-200">{port.scan?.time ? new Date(port.scan.time).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <SectionHeader title="Installed Packages" sectionKey="packages" />
        {openSections.packages && (
          <div className="mb-10">
            {packages.length === 0 ? (
              <p className="text-gray-600">No packages info available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                    <p><strong>Name:</strong> {pkg.name}</p>
                    <p><strong>Version:</strong> {pkg.version}</p>
                    <p><strong>Vendor:</strong> {pkg.vendor || 'N/A'}</p>
                    <p><strong>Architecture:</strong> {pkg.architecture}</p>
                    <p><strong>Install Time:</strong> {pkg.install_time ? new Date(pkg.install_time).toLocaleString() : 'N/A'}</p>
                    <p><strong>Format:</strong> {pkg.format}</p>
                    <p><strong>Size:</strong> {pkg.size.toLocaleString()} bytes</p>
                    <p><strong>Scan Time:</strong> {pkg.scan?.time ? new Date(pkg.scan.time).toLocaleString() : 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Processes" sectionKey="processes" />
        {openSections.processes && (
          <div className="mb-10 overflow-x-auto">
            {processes.length === 0 ? (
              <p className="text-gray-600">No process info available.</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border border-gray-200">PID</th>
                    <th className="px-4 py-2 border border-gray-200">Name</th>
                    <th className="px-4 py-2 border border-gray-200">Command</th>
                    <th className="px-4 py-2 border border-gray-200">PPID</th>
                    <th className="px-4 py-2 border border-gray-200">Priority</th>
                    <th className="px-4 py-2 border border-gray-200">Threads</th>
                    <th className="px-4 py-2 border border-gray-200">Size</th>
                    <th className="px-4 py-2 border border-gray-200">VM Size</th>
                    <th className="px-4 py-2 border border-gray-200">Scan Time</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((proc, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-200">{proc.pid}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.name}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.cmd}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.ppid}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.priority}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.nlwp}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.size.toLocaleString()}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.vm_size.toLocaleString()}</td>
                      <td className="px-4 py-2 border border-gray-200">{proc.scan?.time ? new Date(proc.scan.time).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AgentDetails;
