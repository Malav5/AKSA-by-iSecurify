import React from 'react';

const RemoveAgentModal = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in-fast">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 max-w-4xl min-w-[600px] min-h-[500px] w-full relative max-h-[95vh] flex flex-col animate-zoom-in">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-start rounded-t-xl">
          <h2 className="text-2xl font-bold text-blue-700">Remove Wazuh Agent</h2>
          <button className="text-gray-500 hover:text-blue-600 text-2xl font-bold" onClick={onClose}>×</button>
        </div>
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 scrollbar-hide">
          {/* macOS Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><span className="text-2xl mr-2">🍏</span>macOS (iMac)</h3>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre mb-2">{`sudo launchctl unload /Library/LaunchDaemons/com.wazuh.agent.plist
sudo rm -rf /Library/ossec /Library/LaunchDaemons/com.wazuh.agent.plist /Library/Receipts/wazuh-agent.pkg`}</pre>
          </div>
          {/* Linux Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><span className="text-2xl mr-2">🐧</span>Linux</h3>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre mb-2">{`sudo systemctl stop wazuh-agent
sudo /var/ossec/bin/wazuh-control stop
sudo apt remove --purge wazuh-agent -y && sudo rm -rf /var/ossec`}</pre>
            <div className="text-sm text-gray-700 mb-2">For RPM-based distros (like CentOS/RHEL):</div>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre mb-2">{`sudo yum remove wazuh-agent -y && sudo rm -rf /var/ossec`}</pre>
          </div>
          {/* Windows Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><span className="text-2xl mr-2">🪟</span>Windows (Run in Command Prompt as Administrator)</h3>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre mb-2">{`sc stop WazuhSvc
"%PROGRAMFILES%\\ossec-agent\\uninstall.exe" /S`}</pre>
            <div className="text-sm text-gray-700 mb-2">If needed, manually delete leftover files:</div>
            <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 text-sm overflow-x-auto add-agent-modal-pre mb-2">{`rmdir /S /Q "%PROGRAMFILES%\\ossec-agent"`}</pre>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveAgentModal;