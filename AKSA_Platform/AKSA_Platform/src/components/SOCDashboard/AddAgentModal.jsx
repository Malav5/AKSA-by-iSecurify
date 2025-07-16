import React, { useState } from 'react';

const osOptions = [
  { label: 'LINUX', value: 'linux', packages: [
    { label: 'RPM amd64', value: 'rpm_amd64' },
    { label: 'RPM aarch64', value: 'rpm_aarch64' },
    { label: 'DEB amd64', value: 'deb_amd64' },
    { label: 'DEB aarch64', value: 'deb_aarch64' },
  ] },
  { label: 'WINDOWS', value: 'windows', packages: [
    { label: 'MSI 32/64 bits', value: 'msi' },
  ] },
  { label: 'macOS', value: 'macos', packages: [
    { label: 'Intel', value: 'intel' },
    { label: 'Apple silicon', value: 'apple_silicon' },
  ] },
];

const defaultServer = '192.168.1.198';
const defaultGroup = 'Default';

function getInstallCommand(os, pkg, server) {
  if (os === 'windows') {
    return `Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.12.0-1.msi -OutFile $env:tmp\wazuh-agent; msiexec.exe /i $env:tmp\wazuh-agent /q WAZUH_MANAGER='${server}'`;
  }
  if (os === 'linux') {
    if (pkg.startsWith('rpm')) {
      return `curl -O https://packages.wazuh.com/4.x/yum/wazuh-agent-4.12.0-1.${pkg === 'rpm_amd64' ? 'x86_64' : 'aarch64'}.rpm && sudo rpm -ivh wazuh-agent-4.12.0-1.${pkg === 'rpm_amd64' ? 'x86_64' : 'aarch64'}.rpm && sudo WAZUH_MANAGER='${server}' /var/ossec/bin/agent-auth -m ${server}`;
    } else {
      return `curl -O https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent_4.12.0-1_${pkg === 'deb_amd64' ? 'amd64' : 'arm64'}.deb && sudo dpkg -i wazuh-agent_4.12.0-1_${pkg === 'deb_amd64' ? 'amd64' : 'arm64'}.deb && sudo WAZUH_MANAGER='${server}' /var/ossec/bin/agent-auth -m ${server}`;
    }
  }
  if (os === 'macos') {
    return `brew install wazuh/tap/wazuh-agent && sudo WAZUH_MANAGER='${server}' /Library/Ossec/bin/agent-auth -m ${server}`;
  }
  return '';
}

function getStartCommand(os) {
  if (os === 'windows') return 'NET START WazuhSvc';
  if (os === 'linux') return 'sudo systemctl start wazuh-agent';
  if (os === 'macos') return 'sudo launchctl load /Library/LaunchDaemons/com.wazuh.agent.plist';
  return '';
}

const AddAgentModal = ({ visible, onClose }) => {
  const [selectedOS, setSelectedOS] = useState('linux');
  const [selectedPkg, setSelectedPkg] = useState('rpm_amd64');
  const [server, setServer] = useState(defaultServer);
  const [rememberServer, setRememberServer] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [group, setGroup] = useState(defaultGroup);
  // Copy feedback state
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedStart, setCopiedStart] = useState(false);

  // Update package when OS changes
  React.useEffect(() => {
    const osObj = osOptions.find(o => o.value === selectedOS);
    setSelectedPkg(osObj.packages[0].value);
  }, [selectedOS]);

  const installCmd = getInstallCommand(selectedOS, selectedPkg, server);
  const startCmd = getStartCommand(selectedOS);

  // Copy handlers
  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'install') {
        setCopiedInstall(true);
        setTimeout(() => setCopiedInstall(false), 1200);
      } else {
        setCopiedStart(true);
        setTimeout(() => setCopiedStart(false), 1200);
      }
    } catch (e) {
      // fallback or error
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in-fast">
      <div className="bg-white rounded-xl shadow-2xl  max-w-4xl min-w-[600px] min-h-[500px] w-full relative max-h-[95vh] flex flex-col animate-zoom-in">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-start rounded-t-xl">
          <h2 className="text-2xl font-bold text-primary">Deploy new agent</h2>
          <button className="text-gray-500 hover:text-primary text-2xl font-bold" onClick={onClose}>×</button>
        </div>
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Step 1: OS/Package */}
          <div className="mb-6">
            <div className="font-semibold mb-2">1. Select the package to download and install on your system:</div>
            <div className="flex gap-6 mb-2">
              {osOptions.map(os => (
                <div key={os.value} className={`flex-1 border rounded-xl p-4 cursor-pointer ${selectedOS === os.value ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'}`}
                  onClick={() => setSelectedOS(os.value)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{os.label === 'LINUX' ? '🐧' : os.label === 'WINDOWS' ? '🪟' : '🍏'}</span>
                    <span className="font-bold text-lg">{os.label}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {os.packages.map(pkg => (
                      <label key={pkg.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`pkg-${os.value}`} checked={selectedPkg === pkg.value} onChange={() => setSelectedPkg(pkg.value)} className="accent-primary focus:ring-primary text-primary" />
                        <span>{pkg.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Step 4: Install command (now step 2) */}
          <div className="mb-6">
            <div className="font-semibold mb-2 flex items-center gap-2">
              2. Run the following commands to download and install the agent:
              <button
                className="ml-2 px-2 py-1 text-xs rounded bg-secondary text-primary font-semibold border border-primary hover:bg-primary hover:text-white transition"
                onClick={() => handleCopy(installCmd, 'install')}
                type="button"
              >
                {copiedInstall ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-100 rounded p-3 text-sm select-all mb-2 custom-scrollbar-x whitespace-pre-wrap">{installCmd}</pre>
            <div className="text-m text-primary bg-primary/10 rounded p-4 mb-2">
              <b>Requirements</b>
              <ul className="list-disc ml-5">
                <li>You will need administrator privileges to perform this installation.</li>
                <li>PowerShell 3.0 or greater is required (for Windows).</li>
              </ul>
              Keep in mind you need to run this command in a Windows PowerShell terminal (for Windows installs).
            </div>
          </div>
          {/* Step 5: Start agent (now step 3) */}
          <div className="mb-6">
            <div className="font-semibold mb-2 flex items-center gap-2">
              3. Start the agent:
              <button
                className="ml-2 px-2 py-1 text-xs rounded bg-secondary text-primary font-semibold border border-primary hover:bg-primary hover:text-white transition"
                onClick={() => handleCopy(startCmd, 'start')}
                type="button"
              >
                {copiedStart ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-100 rounded p-3 text-sm select-all add-agent-modal-pre whitespace-pre-wrap">{startCmd}</pre>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAgentModal; 