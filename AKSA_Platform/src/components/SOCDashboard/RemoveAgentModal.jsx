import React, { useState } from 'react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setCopied(false);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 text-xs rounded bg-secondary text-primary font-semibold border border-primary hover:bg-primary hover:text-white transition"
      title="Copy to clipboard"
      type="button"
      style={{ minWidth: 54 }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const RemoveAgentModal = ({ visible, onClose }) => {
  if (!visible) return null;

  // Command blocks
  const macCmd = `sudo launchctl unload /Library/LaunchDaemons/com.wazuh.agent.plist\nsudo rm -rf /Library/ossec /Library/LaunchDaemons/com.wazuh.agent.plist /Library/Receipts/wazuh-agent.pkg`;
  const linuxCmd = `sudo systemctl stop wazuh-agent\nsudo /var/ossec/bin/wazuh-control stop\nsudo apt remove --purge wazuh-agent -y && sudo rm -rf /var/ossec`;
  const rpmCmd = `sudo yum remove wazuh-agent -y && sudo rm -rf /var/ossec`;
  const winCmd = `sc stop WazuhSvc\n"%PROGRAMFILES%\\ossec-agent\\uninstall.exe" /S`;
  const winManualCmd = `rmdir /S /Q "%PROGRAMFILES%\\ossec-agent"`;

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in-fast">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-custom max-w-4xl min-w-[600px] min-h-[500px] w-full relative max-h-[95vh] flex flex-col animate-zoom-in">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-start rounded-t-xl">
          <h2 className="text-2xl font-bold text-primary">Remove Wazuh Agent</h2>
          <button className="text-gray-500 hover:text-blue-600 text-2xl font-bold" onClick={onClose}>×</button>
        </div>
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 scrollbar-hide">
          {/* macOS Section */}
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold flex items-center"><span className="text-2xl mr-2">🍏</span>macOS (iMac)</h3>
              <CopyButton text={macCmd} />
            </div>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre custom-scrollbar mb-2">{macCmd}</pre>
          </div>
          {/* Linux Section */}
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold flex items-center"><span className="text-2xl mr-2">🐧</span>Linux</h3>
              <CopyButton text={linuxCmd} />
            </div>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre custom-scrollbar mb-2">{linuxCmd}</pre>
            <div className="text-sm text-gray-700 mb-2 flex items-center">For RPM-based distros (like CentOS/RHEL):
              <CopyButton text={rpmCmd} />
            </div>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre custom-scrollbar mb-2">{rpmCmd}</pre>
          </div>
          {/* Windows Section */}
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold flex items-center"><span className="text-2xl mr-2">🪟</span>Windows (Run in Command Prompt as Administrator)</h3>
              <CopyButton text={winCmd} />
            </div>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre custom-scrollbar mb-2">{winCmd}</pre>
            <div className="text-sm text-gray-700 mb-2 flex items-center">If needed, manually delete leftover files:
              <CopyButton text={winManualCmd} />
            </div>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre custom-scrollbar mb-2">{winManualCmd}</pre>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded bg-primary text-white" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveAgentModal;