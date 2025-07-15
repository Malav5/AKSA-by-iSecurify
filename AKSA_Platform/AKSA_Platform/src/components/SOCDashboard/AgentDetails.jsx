import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const AgentDetails = ({ agentId, onBack }) => {
  const [agentData, setAgentData] = useState({
    hardware: [],
    hotfixes: [],
    netaddr: [],
    osInfo: [],
    packages: [],
    ports: [],
    processes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    osInfo: true,
    hardware: false,
    hotfixes: false,
    netaddr: false,
    ports: false,
    packages: false,
    processes: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const expandAllSections = () => {
    setExpandedSections({
      osInfo: true,
      hardware: true,
      hotfixes: true,
      netaddr: true,
      ports: true,
      packages: true,
      processes: true,
    });
  };

  const collapseAllSections = () => {
    setExpandedSections({
      osInfo: false,
      hardware: false,
      hotfixes: false,
      netaddr: false,
      ports: false,
      packages: false,
      processes: false,
    });
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:3000/api/wazuh/agent-detail/${agentId}`);
        
        setAgentData({
          hardware: res.data.hardware || [],
          hotfixes: res.data.hotfixes || [],
          netaddr: res.data.netaddr || [],
          osInfo: res.data.os || [],
          packages: res.data.packages || [],
          ports: res.data.ports || [],
          processes: res.data.processes || []
        });
      } catch (err) {
        console.error("Error loading agent details", err);
        setError("Failed to load agent details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [agentId]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
          <Navbar />
        </div>
        <div className="flex items-center justify-center h-screen bg-gray-50 pt-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading agent details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
       
        <div className="bg-white p-6 rounded-xl shadow-lg my-20 max-w-7xl mx-auto scrollbar-hide">
          <div className="text-center py-10">
            <div className="text-red-500 mb-4 text-lg">{error}</div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              ← Back to Agents
            </button>
          </div>
        </div>
      </>
    );
  }

  const SectionHeader = ({ title, sectionKey }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full text-left py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 font-medium flex justify-between items-center transition-colors"
    >
      <span className="font-semibold text-gray-800">{title}</span>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="text-gray-500" size={18} />
      ) : (
        <ChevronDown className="text-gray-500" size={18} />
      )}
    </button>
  );

  return (
    <>
     

      <div className="my-20 max-w-7xl mx-auto scrollbar-hide py-10">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Agents
          </button>
          <div className="flex space-x-2">
            <button
              onClick={expandAllSections}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllSections}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-800">Agent ID: {agentId}</h2>
          {agentData.osInfo[0] && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">OS: </span>
              {agentData.osInfo[0].os?.name} {agentData.osInfo[0].os?.version} ({agentData.osInfo[0].architecture})
            </div>
          )}
        </div>

        {/* Sections */}
        <SectionHeader title="Operating System" sectionKey="osInfo" />
        {expandedSections.osInfo && (
          <div className="mb-8">
            {agentData.osInfo.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No OS information available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentData.osInfo.map((os, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="space-y-2">
                      <DetailRow label="Hostname" value={os.hostname} />
                      <DetailRow label="OS Name" value={os.os?.name} />
                      <DetailRow label="Version" value={os.os?.version} />
                      <DetailRow label="Build" value={os.os?.build} />
                      <DetailRow label="Display Version" value={os.os?.display_version} />
                      <DetailRow label="Architecture" value={os.architecture} />
                      <DetailRow label="Release" value={os.os_release} />
                      <DetailRow label="Scan Time" value={formatDate(os.scan?.time)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Hardware Information" sectionKey="hardware" />
        {expandedSections.hardware && (
          <div className="mb-8">
            {agentData.hardware.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No hardware information available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentData.hardware.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="space-y-2">
                      <DetailRow label="CPU Name" value={item.cpu?.name} />
                      <DetailRow label="CPU Cores" value={item.cpu?.cores} />
                      <DetailRow label="CPU MHz" value={item.cpu?.mhz} />
                      <DetailRow label="RAM Total" value={`${item.ram?.total} MB`} />
                      <DetailRow label="RAM Free" value={`${item.ram?.free} MB`} />
                      <DetailRow label="RAM Usage" value={`${item.ram?.usage}%`} />
                      <DetailRow label="Board Serial" value={item.board_serial} />
                      <DetailRow label="Scan Time" value={formatDate(item.scan?.time)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Hotfixes" sectionKey="hotfixes" />
        {expandedSections.hotfixes && (
          <div className="mb-8">
            {agentData.hotfixes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No hotfix information available
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentData.hotfixes.map((fix, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    <DetailRow label="Hotfix" value={fix.hotfix} />
                    <DetailRow label="Scan Time" value={formatDate(fix.scan_time)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Network Addresses" sectionKey="netaddr" />
        {expandedSections.netaddr && (
          <div className="mb-8">
            {agentData.netaddr.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No network information available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentData.netaddr.map((net, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    <DetailRow label="Protocol" value={net.proto} />
                    <DetailRow label="Interface" value={net.iface} />
                    <DetailRow label="Address" value={net.address} />
                    <DetailRow label="Netmask" value={net.netmask} />
                    <DetailRow label="Broadcast" value={net.broadcast?.trim()} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Open Ports" sectionKey="ports" />
        {expandedSections.ports && (
          <div className="mb-8 overflow-x-auto">
            {agentData.ports.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No port information available
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <TableHeader>Local IP</TableHeader>
                      <TableHeader>Local Port</TableHeader>
                      <TableHeader>Remote IP</TableHeader>
                      <TableHeader>Remote Port</TableHeader>
                      <TableHeader>Protocol</TableHeader>
                      <TableHeader>Process</TableHeader>
                      <TableHeader>PID</TableHeader>
                      <TableHeader>State</TableHeader>
                      <TableHeader>Scan Time</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agentData.ports.map((port, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <TableCell>{port.local?.ip || 'N/A'}</TableCell>
                        <TableCell>{port.local?.port || 'N/A'}</TableCell>
                        <TableCell>{port.remote?.ip || 'N/A'}</TableCell>
                        <TableCell>{port.remote?.port || 'N/A'}</TableCell>
                        <TableCell>{port.protocol}</TableCell>
                        <TableCell>{port.process || 'N/A'}</TableCell>
                        <TableCell>{port.pid}</TableCell>
                        <TableCell>{port.state || 'N/A'}</TableCell>
                        <TableCell>{formatDate(port.scan?.time)}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Installed Packages" sectionKey="packages" />
        {expandedSections.packages && (
          <div className="mb-8">
            {agentData.packages.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No package information available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentData.packages.map((pkg, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    <DetailRow label="Name" value={pkg.name} />
                    <DetailRow label="Version" value={pkg.version} />
                    <DetailRow label="Vendor" value={pkg.vendor} />
                    <DetailRow label="Architecture" value={pkg.architecture} />
                    <DetailRow label="Install Time" value={formatDate(pkg.install_time)} />
                    <DetailRow label="Format" value={pkg.format} />
                    <DetailRow label="Size" value={formatBytes(pkg.size)} />
                    <DetailRow label="Scan Time" value={formatDate(pkg.scan?.time)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SectionHeader title="Running Processes" sectionKey="processes" />
        {expandedSections.processes && (
          <div className="mb-8 overflow-x-auto">
            {agentData.processes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No process information available
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <TableHeader>PID</TableHeader>
                      <TableHeader>Name</TableHeader>
                      <TableHeader>Command</TableHeader>
                      <TableHeader>PPID</TableHeader>
                      <TableHeader>Priority</TableHeader>
                      <TableHeader>Threads</TableHeader>
                      <TableHeader>Size</TableHeader>
                      <TableHeader>VM Size</TableHeader>
                      <TableHeader>Scan Time</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agentData.processes.map((proc, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <TableCell>{proc.pid}</TableCell>
                        <TableCell>{proc.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{proc.cmd}</TableCell>
                        <TableCell>{proc.ppid}</TableCell>
                        <TableCell>{proc.priority}</TableCell>
                        <TableCell>{proc.nlwp}</TableCell>
                        <TableCell>{formatBytes(proc.size)}</TableCell>
                        <TableCell>{formatBytes(proc.vm_size)}</TableCell>
                        <TableCell>{formatDate(proc.scan?.time)}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Helper components
const DetailRow = ({ label, value }) => (
  <div className="flex">
    <span className="font-medium text-gray-700 w-32 flex-shrink-0">{label}:</span>
    <span className="text-gray-600 flex-1">{value || 'N/A'}</span>
  </div>
);

const TableHeader = ({ children }) => (
  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-2 text-sm text-gray-600 ${className}`}>
    {children}
  </td>
);

export default AgentDetails;