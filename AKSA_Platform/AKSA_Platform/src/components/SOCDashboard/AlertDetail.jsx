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

  const ruleCompliance = {
    pci_dss: rule.pci_dss,
    hipaa: rule.hipaa,
    tsc: rule.tsc,
    nist_800_53: rule.nist_800_53,
    gpg13: rule.gpg13,
    gdpr: rule.gdpr,
  };

  const parsePorts = (text) => {
    if (!text) return [];
    return text.split('\n').map(line => {
      const match = line.match(/(tcp4|tcp6|tcp46|udp4|udp6|udp46)\s+([^:]+):(\d+)/);
      return match ? { protocol: match[1], address: match[2], port: match[3] } : null;
    }).filter(Boolean);
  };

  const currentPorts = parsePorts(description);
  const previousPorts = parsePorts(previous_log);

  const getPortChanges = () => {
    const format = (p) => `${p.protocol}:${p.port}`;
    const current = new Set(currentPorts.map(format));
    const previous = new Set(previousPorts.map(format));
    return {
      added: currentPorts.filter(p => !previous.has(format(p))),
      removed: previousPorts.filter(p => !current.has(format(p))),
    };
  };

  const portChanges = getPortChanges();

  const severityColor = {
    critical: 'bg-pink-100 text-pink-800',
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 bg-opacity-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-hide">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600 text-3xl font-bold leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Grid Info Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Alert Info */}
            <Section title="Alert Information">
              <Info label="Alert ID" value={id} />
              <Info label="Severity" value={
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${severityColor[severity] || 'bg-gray-100 text-gray-800'}`}>
                  {severity}
                </span>
              } />
              <Info label="Time" value={time} />
              <Info label="Location" value={location} />
              <Info label="Decoder" value={decoder?.name} />
            </Section>

            {/* Agent Info */}
            <Section title="Agent Information">
              <Info label="Agent Name" value={agentName} />
              <Info label="Agent ID" value={agent.id} />
              <Info label="Agent IP" value={agent.ip} />
              <Info label="Manager" value={manager.name} />
            </Section>

            {/* Rule Info */}
            <Section title="Rule Information">
              <Info label="Rule ID" value={rule.id} />
              <Info label="Level" value={rule.level} />
              <Info label="Groups" value={rule.groups?.join(', ')} />
              <Info label="Fired Times" value={rule.firedtimes} />
              <Info label="Mail Alert" value={rule.mail ? 'Yes' : 'No'} />
            </Section>

            {/* Compliance Info */}
            {Object.values(ruleCompliance).some(Boolean) && (
              <Section title="Compliance Mappings" textColor="text-blue-800">
                {Object.entries(ruleCompliance).map(([key, value]) => (
                  value ? <Info key={key} label={key.toUpperCase()} value={Array.isArray(value) ? value.join(', ') : value} /> : null
                ))}
              </Section>
            )}
          </div>

          {/* Port Changes */}
          {(portChanges.added.length > 0 || portChanges.removed.length > 0) && (
            <Section title="Port Changes Detected" bgColor="bg-red-50" textColor="text-red-800">
              {portChanges.added.length > 0 && (
                <div>
                  <strong className="text-green-700 block">Newly Opened Ports:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    {portChanges.added.map((p, i) => (
                      <div key={i} className="bg-green-100 rounded p-1 text-xs">{p.protocol} → {p.address}:{p.port}</div>
                    ))}
                  </div>
                </div>
              )}
              {portChanges.removed.length > 0 && (
                <div className="mt-3">
                  <strong className="text-red-700 block">Recently Closed Ports:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    {portChanges.removed.map((p, i) => (
                      <div key={i} className="bg-red-100 rounded p-1 text-xs">{p.protocol} → {p.address}:{p.port}</div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* SCA Check */}
          {scaCheck && (
            <Section title="SCA Check Details" bgColor="bg-green-50" textColor="text-green-800">
              <Info label="Check Title" value={scaCheck.title} />
              <Info label="Result" value={scaCheck.result} />
              <Info label="Policy" value={data?.sca?.policy} />
              <Info label="Rationale" value={scaCheck.rationale} />
              {scaCheck.command && (
                <Info label="Command" value={<pre className="bg-white p-2 rounded text-xs">{scaCheck.command.join('\n')}</pre>} />
              )}
              {scaCheck.remediation && (
                <Info label="Remediation" value={<pre className="bg-white p-2 rounded text-xs whitespace-pre-wrap">{scaCheck.remediation}</pre>} />
              )}
            </Section>
          )}

          {/* MITRE Info */}
          {(rule.mitre_tactics || rule.mitre_techniques || rule.mitre_mitigations) && (
            <Section title="MITRE ATT&CK" bgColor="bg-purple-50" textColor="text-purple-800">
              {rule.mitre_tactics && <Info label="Tactics" value={rule.mitre_tactics.join(', ')} />}
              {rule.mitre_techniques && <Info label="Techniques" value={rule.mitre_techniques.join(', ')} />}
              {rule.mitre_mitigations && <Info label="Mitigations" value={rule.mitre_mitigations.join(', ')} />}
            </Section>
          )}

          {/* Description */}
          <Section title="Current Port Status">
            <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto">{description}</pre>
          </Section>

          {/* Previous Output */}
          {previous_output && (
            <Section title="Previous Output" bgColor="bg-yellow-50" textColor="text-yellow-800">
              <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto">{previous_output}</pre>
            </Section>
          )}

          {/* Previous Log */}
          {previous_log && (
            <Section title="Previous Port Status" bgColor="bg-orange-50" textColor="text-orange-800">
              <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto">{previous_log}</pre>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

// Components
const Section = ({ title, children, bgColor = 'bg-gray-50', textColor = 'text-gray-800' }) => (
  <section className={`${bgColor} p-4 rounded-lg shadow-sm`}>
    <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>{title}</h3>
    <div className="space-y-2 text-sm">{children}</div>
  </section>
);

const Info = ({ label, value }) => (
  <p><strong className="text-gray-700">{label}:</strong> <span className="text-gray-900">{value || 'N/A'}</span></p>
);

export default AlertDetail;
