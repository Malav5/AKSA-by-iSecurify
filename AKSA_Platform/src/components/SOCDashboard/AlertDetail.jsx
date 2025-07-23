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
    critical: 'bg-pink-100 text-pink-800 border-pink-300',
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-gradient-to-br from-gray-900/60 to-blue-200/30 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-hide animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-white border-b px-8 py-5 flex justify-between items-center shadow-sm rounded-t-2xl">
          <h2 className="text-2xl font-extrabold text-primary tracking-tight flex items-center gap-3">
            <span className={`inline-block px-3 py-1 rounded-full border font-semibold text-sm uppercase ${severityColor[severity] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>{severity}</span>
            <span className="truncate max-w-[60vw]">{title}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 bg-gray-100 hover:bg-red-100 rounded-full w-10 h-10 flex items-center justify-center text-3xl font-bold leading-none shadow transition-all duration-200">
            ×
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Alert Info */}
            <Section title="Alert Information" icon="⚡">
              <Info label="Alert ID" value={<Badge>{id}</Badge>} />
              <Info label="Time" value={<Badge color="bg-blue-100 text-blue-800 border-blue-300">{time}</Badge>} />
              <Info label="Location" value={location} />
              <Info label="Decoder" value={decoder?.name} />
            </Section>
            {/* Agent Info */}
            <Section title="Agent Information" icon="🖥️">
              <Info label="Agent Name" value={<Badge color="bg-indigo-100 text-indigo-800 border-indigo-300">{agentName}</Badge>} />
              <Info label="Agent ID" value={<Badge>{agent.id}</Badge>} />
              <Info label="Agent IP" value={agent.ip} />
              <Info label="Manager" value={manager.name} />
            </Section>
            {/* Rule Info */}
            <Section title="Rule Information" icon="📜">
              <Info label="Rule ID" value={<Badge>{rule.id}</Badge>} />
              <Info label="Level" value={<Badge color="bg-yellow-100 text-yellow-800 border-yellow-300">{rule.level}</Badge>} />
              <Info label="Groups" value={rule.groups?.join(', ')} />
              <Info label="Fired Times" value={rule.firedtimes} />
              <Info label="Mail Alert" value={rule.mail ? <Badge color="bg-green-100 text-green-800 border-green-300">Yes</Badge> : <Badge color="bg-gray-100 text-gray-800 border-gray-200">No</Badge>} />
            </Section>
            {/* Compliance Info */}
            {Object.values(ruleCompliance).some(Boolean) && (
              <Section title="Compliance Mappings" icon="✅" textColor="text-blue-800" bgColor="bg-blue-50">
                {Object.entries(ruleCompliance).map(([key, value]) => (
                  value ? <Info key={key} label={key.toUpperCase()} value={<Badge color="bg-blue-100 text-blue-800 border-blue-300">{Array.isArray(value) ? value.join(', ') : value}</Badge>} /> : null
                ))}
              </Section>
            )}
          </div>

          {/* Port Changes */}
          {(portChanges.added.length > 0 || portChanges.removed.length > 0) && (
            <Section title="Port Changes Detected" icon="🔌" bgColor="bg-red-50" textColor="text-red-800">
              {portChanges.added.length > 0 && (
                <div>
                  <strong className="text-green-700 block mb-1">Newly Opened Ports:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    {portChanges.added.map((p, i) => (
                      <div key={i} className="bg-green-100 rounded p-1 text-xs font-mono border border-green-200">{p.protocol} → {p.address}:{p.port}</div>
                    ))}
                  </div>
                </div>
              )}
              {portChanges.removed.length > 0 && (
                <div className="mt-3">
                  <strong className="text-red-700 block mb-1">Recently Closed Ports:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    {portChanges.removed.map((p, i) => (
                      <div key={i} className="bg-red-100 rounded p-1 text-xs font-mono border border-red-200">{p.protocol} → {p.address}:{p.port}</div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* SCA Check */}
          {scaCheck && (
            <Section title="SCA Check Details" icon="🔍" bgColor="bg-green-50" textColor="text-green-800">
              <Info label="Check Title" value={scaCheck.title} />
              <Info label="Result" value={<Badge color="bg-blue-100 text-blue-800 border-blue-300">{scaCheck.result}</Badge>} />
              <Info label="Policy" value={data?.sca?.policy} />
              <Info label="Rationale" value={scaCheck.rationale} />
              {scaCheck.command && (
                <Info label="Command" value={<pre className="bg-white p-2 rounded text-xs font-mono border border-gray-200">{scaCheck.command.join('\n')}</pre>} />
              )}
              {scaCheck.remediation && (
                <Info label="Remediation" value={<pre className="bg-white p-2 rounded text-xs font-mono border border-gray-200 whitespace-pre-wrap">{scaCheck.remediation}</pre>} />
              )}
            </Section>
          )}

          {/* MITRE Info */}
          {(rule.mitre_tactics || rule.mitre_techniques || rule.mitre_mitigations) && (
            <Section title="MITRE ATT&CK" icon="🛡️" bgColor="bg-purple-50" textColor="text-purple-800">
              {rule.mitre_tactics && <Info label="Tactics" value={<Badge color="bg-purple-100 text-purple-800 border-purple-300">{rule.mitre_tactics.join(', ')}</Badge>} />}
              {rule.mitre_techniques && <Info label="Techniques" value={<Badge color="bg-purple-100 text-purple-800 border-purple-300">{rule.mitre_techniques.join(', ')}</Badge>} />}
              {rule.mitre_mitigations && <Info label="Mitigations" value={<Badge color="bg-purple-100 text-purple-800 border-purple-300">{rule.mitre_mitigations.join(', ')}</Badge>} />}
            </Section>
          )}

          {/* Description */}
          <Section title="Current Port Status" icon="📄">
            <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto border border-gray-200">{description}</pre>
          </Section>

          {/* Previous Output */}
          {previous_output && (
            <Section title="Previous Output" icon="🕒" bgColor="bg-yellow-50" textColor="text-yellow-800">
              <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto border border-gray-200">{previous_output}</pre>
            </Section>
          )}

          {/* Previous Log */}
          {previous_log && (
            <Section title="Previous Port Status" icon="📝" bgColor="bg-orange-50" textColor="text-orange-800">
              <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap overflow-x-auto border border-gray-200">{previous_log}</pre>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

// Components
const Section = ({ title, icon, children, bgColor = 'bg-gray-50', textColor = 'text-gray-800' }) => (
  <section className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-100 mb-2`}> 
    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textColor}`}>
      {icon && <span className="text-xl">{icon}</span>}
      {title}
    </h3>
    <div className="space-y-2 text-sm">{children}</div>
  </section>
);

const Info = ({ label, value }) => (
  <p className="flex items-center gap-2"><strong className="text-gray-700 min-w-[110px] inline-block">{label}:</strong> <span className="text-gray-900 break-all">{value || 'N/A'}</span></p>
);

const Badge = ({ children, color = 'bg-gray-100 text-gray-800 border-gray-200' }) => (
  <span className={`inline-block px-2 py-1 rounded border text-xs font-semibold ${color}`}>{children}</span>
);

export default AlertDetail;
