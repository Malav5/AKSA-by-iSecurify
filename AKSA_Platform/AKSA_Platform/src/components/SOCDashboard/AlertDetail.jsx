import React from 'react';

const AlertDetail = ({ alert, onClose }) => {
  if (!alert) return null;

  const {
    title,
    severity,
    agentName,
    time,
    description,
    rule = {},
    data = {},
    decoder,
    location,
    id,
    agent = {},
    manager = {},
    previous_output,
    previous_log,
  } = alert;

  const compliance = data?.sca?.check?.compliance || {};
  const scaCheck = data?.sca?.check;

  // Extract compliance mappings from rule
  const ruleCompliance = {
    pci_dss: rule.pci_dss,
    hipaa: rule.hipaa,
    tsc: rule.tsc,
    nist_800_53: rule.nist_800_53,
    gpg13: rule.gpg13,
    gdpr: rule.gdpr,
  };

  // Helper function to parse port information
  const parsePorts = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const ports = [];
    
    lines.forEach(line => {
      const match = line.match(/(tcp4|tcp6|tcp46|udp4|udp6|udp46)\s+([^:]+):(\d+)/);
      if (match) {
        ports.push({
          protocol: match[1],
          address: match[2],
          port: match[3],
          fullLine: line.trim()
        });
      }
    });
    
    return ports;
  };

  // Compare current and previous ports
  const currentPorts = parsePorts(description);
  const previousPorts = parsePorts(previous_log);
  
  const getPortChanges = () => {
    const currentPortSet = new Set(currentPorts.map(p => `${p.protocol}:${p.port}`));
    const previousPortSet = new Set(previousPorts.map(p => `${p.protocol}:${p.port}`));
    
    const added = currentPorts.filter(p => !previousPortSet.has(`${p.protocol}:${p.port}`));
    const removed = previousPorts.filter(p => !currentPortSet.has(`${p.protocol}:${p.port}`));
    
    return { added, removed };
  };

  const portChanges = getPortChanges();

  return (
    <div className="fixed inset-0 bg-gray-900/50 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 bg-white p-4 mb-4 border-b border-gray-200 flex justify-between items-center">
  <h2 className="text-2xl font-bold">{title}</h2>
  <button
    onClick={onClose}
    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
  >
    ×
  </button>
</div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Alert Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Alert ID:</strong> {id}</p>
                <p><strong>Severity:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                    severity === 'critical' ? 'bg-pink-100 text-pink-800' :
                    severity === 'high' ? 'bg-red-100 text-red-800' :
                    severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {severity}
                  </span>
                </p>
                <p><strong>Time:</strong> {time}</p>
                <p><strong>Location:</strong> {location}</p>
                <p><strong>Decoder:</strong> {decoder?.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Agent Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Agent Name:</strong> {agentName}</p>
                <p><strong>Agent ID:</strong> {agent.id}</p>
                <p><strong>Agent IP:</strong> {agent.ip}</p>
                <p><strong>Manager:</strong> {manager.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Rule Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Rule ID:</strong> {rule.id}</p>
                <p><strong>Rule Level:</strong> {rule.level}</p>
                <p><strong>Rule Groups:</strong> {rule.groups?.join(', ')}</p>
                <p><strong>Fired Times:</strong> {rule.firedtimes}</p>
                <p><strong>Mail Alert:</strong> {rule.mail ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Compliance & Details */}
          <div className="space-y-4">
            {/* Port Changes Summary */}
            {portChanges.added.length > 0 || portChanges.removed.length > 0 ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-red-800">Port Changes Detected</h3>
                <div className="space-y-2 text-sm">
                  {portChanges.added.length > 0 && (
                    <div>
                      <strong className="text-green-700">Newly Opened Ports ({portChanges.added.length}):</strong>
                      <div className="ml-2 mt-1 space-y-1">
                        {portChanges.added.map((port, idx) => (
                          <div key={idx} className="bg-green-100 p-2 rounded text-xs">
                            <strong>{port.protocol}:</strong> {port.address}:{port.port}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {portChanges.removed.length > 0 && (
                    <div>
                      <strong className="text-red-700">Recently Closed Ports ({portChanges.removed.length}):</strong>
                      <div className="ml-2 mt-1 space-y-1">
                        {portChanges.removed.map((port, idx) => (
                          <div key={idx} className="bg-red-100 p-2 rounded text-xs">
                            <strong>{port.protocol}:</strong> {port.address}:{port.port}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Compliance Mappings */}
            {Object.entries(ruleCompliance).some(([key, value]) => value && value.length > 0) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Compliance Mappings</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(ruleCompliance).map(([key, value]) => 
                    value && value.length > 0 && (
                      <div key={key}>
                        <strong className="text-blue-700">{key.toUpperCase()}:</strong>
                        <div className="ml-2 mt-1">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* SCA Check Details */}
            {scaCheck && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">SCA Check Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Check Title:</strong> {scaCheck.title}</p>
                  <p><strong>Result:</strong> {scaCheck.result}</p>
                  <p><strong>Policy:</strong> {data?.sca?.policy}</p>
                  <p><strong>Rationale:</strong> {scaCheck.rationale}</p>
                  {scaCheck.command && (
                    <div>
                      <strong>Command:</strong>
                      <pre className="bg-white p-2 rounded text-xs mt-1 overflow-x-auto">{scaCheck.command.join('\n')}</pre>
                    </div>
                  )}
                  {scaCheck.remediation && (
                    <div>
                      <strong>Remediation:</strong>
                      <pre className="bg-white p-2 rounded text-xs mt-1 whitespace-pre-wrap">{scaCheck.remediation}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MITRE Information */}
            {(rule.mitre_tactics || rule.mitre_techniques || rule.mitre_mitigations) && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">MITRE ATT&CK</h3>
                <div className="space-y-2 text-sm">
                  {rule.mitre_tactics && (
                    <p><strong>Tactics:</strong> {rule.mitre_tactics.join(', ')}</p>
                  )}
                  {rule.mitre_techniques && (
                    <p><strong>Techniques:</strong> {rule.mitre_techniques.join(', ')}</p>
                  )}
                  {rule.mitre_mitigations && (
                    <p><strong>Mitigations:</strong> {rule.mitre_mitigations.join(', ')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-6 bg-gray-50 p-4 m-8 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Current Port Status</h3>
          <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto">{description}</pre>
        </div>

        {/* Previous Output (for port change alerts) */}
        {previous_output && (
          <div className="mt-4 bg-yellow-50 p-4 m-8 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">Previous Output</h3>
            <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto">{previous_output}</pre>
          </div>
        )}

        {/* Previous Log */}
        {previous_log && (
          <div className="mt-4 bg-orange-50 p-4 m-8 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-orange-800">Previous Port Status</h3>
            <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto">{previous_log}</pre>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default AlertDetail;
