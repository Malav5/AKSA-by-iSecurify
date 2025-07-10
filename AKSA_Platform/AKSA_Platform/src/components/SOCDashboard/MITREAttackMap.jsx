import React, { useEffect, useState } from 'react';
import {
  ShieldAlert, Lock, LogIn, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const tacticMap = {
  ssh: { name: 'Initial Access', color: 'bg-blue-100 text-blue-700', icon: <LogIn size={16} /> },
  login: { name: 'Credential Access', color: 'bg-yellow-100 text-yellow-700', icon: <Lock size={16} /> },
  brute: { name: 'Credential Access', color: 'bg-yellow-100 text-yellow-700', icon: <Lock size={16} /> },
  privilege: { name: 'Privilege Escalation', color: 'bg-red-100 text-red-700', icon: <ShieldAlert size={16} /> },
  default: { name: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: <HelpCircle size={16} /> },
};

const MITREAttackMap = ({ topRules }) => {
  const [mitreData, setMitreData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchMitreData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/wazuh/mitre-data');
        const data = await res.json();
        setMitreData(data);
      } catch (err) {
        console.error('Failed to fetch MITRE data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMitreData();
  }, []);

  // Extract MITRE IDs from alert descriptions (topRules)
  const mitreIdRegex = /(T\d{4}|G\d{4}|S\d{4}|M\d{4})/gi;
  const alertMitreIds = new Set();
  topRules.forEach(([desc]) => {
    const matches = desc.match(mitreIdRegex);
    if (matches) {
      matches.forEach(id => alertMitreIds.add(id.toUpperCase()));
    }
  });

  // Helper to filter MITRE data arrays by IDs found in alerts
  const filterMitreData = (arr) => (arr || []).filter(item => alertMitreIds.has(item.id?.toUpperCase()));

  // Filtered MITRE data for preview tables
  const filteredTechniques = filterMitreData(mitreData.techniques);
  const filteredTactics = filterMitreData(mitreData.tactics);
  const filteredMitigations = filterMitreData(mitreData.mitigations);
  const filteredSoftware = filterMitreData(mitreData.software);
  const filteredGroups = filterMitreData(mitreData.groups);

  const mapped = topRules.map(([desc]) => {
    const key = Object.keys(tacticMap).find(k => desc.toLowerCase().includes(k));
    return tacticMap[key] || tacticMap.default;
  });

  const tacticCount = mapped.reduce((acc, tactic) => {
    acc[tactic.name] = (acc[tactic.name] || { ...tactic, count: 0 });
    acc[tactic.name].count += 1;
    return acc;
  }, {});

  const uniqueTactics = Object.values(tacticCount).sort((a, b) => b.count - a.count);

  const renderPreviewTable = (title, items, fields = ['id', 'name']) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm">
      <div
        className="flex justify-between items-center cursor-pointer mb-2"
        onClick={() => setExpanded(expanded === title ? null : title)}
      >
        <h4 className="text-2xl font-semibold text-gray-600">{title} ({items?.length || 0})</h4>
        {expanded === title ? <ChevronUp /> : <ChevronDown />}
      </div>
      {expanded === title && (
        <div className="overflow-x-auto max-h-72 overflow-y-auto scrollbar-hide">
          <table className="w-full text-base text-left">
            <thead>
              <tr className="bg-gray-100">
                {fields.map(f => (
                  <th key={f} className="p-2 capitalize text-gray-600">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(items || []).slice(0, 10).map((item, i) => (
                <tr key={i}>
                  {fields.map(f => (
                    <td key={f} className="p-2">
                      {f === 'name' && item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {item[f]}
                        </a>
                      ) : f === 'description' ? (
                        <span className="text-gray-700 text-base">
                          {item[f]?.slice(0, 100)}...
                        </span>
                      ) : (
                        item[f] || '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {items?.length > 10 && (
            <p className="text-base text-gray-500 mt-1">Showing first 10 items</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-2xl p-10 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🧠</span>
        <h3 className="text-3xl font-bold text-gray-900">MITRE ATT&CK Mapping</h3>
      </div>
      <div className="text-lg text-gray-500 mb-6">
        This section maps triggered alert rule descriptions to MITRE ATT&CK tactics for identifying adversary behaviors.
      </div>

      {/* Tactic Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {uniqueTactics.map((tactic, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xl ${tactic.color}`}
          >
            {tactic.icon}
            <span>{tactic.name}</span>
            <span className="ml-2 text-xl text-gray-600">({tactic.count})</span>
          </div>
        ))}
      </div>

      {/* 2x2 Grid of Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-6 flex flex-col items-center justify-center min-w-[180px] min-h-[110px]">
          <div className="text-6xl font-bold text-gray-900 mb-1">{filteredTechniques.length}</div>
          <div className="text-2xl text-gray-600">Techniques</div>
        </div>
        <div className="bg-white border rounded-xl p-6 flex flex-col items-center justify-center min-w-[180px] min-h-[110px]">
          <div className="text-6xl font-bold text-gray-900 mb-1">{filteredTactics.length}</div>
          <div className="text-2xl text-gray-600">Tactics</div>
        </div>
        <div className="bg-white border rounded-xl p-6 flex flex-col items-center justify-center min-w-[180px] min-h-[110px]">
          <div className="text-6xl font-bold text-gray-900 mb-1">{filteredMitigations.length}</div>
          <div className="text-2xl text-gray-600">Mitigations</div>
        </div>
        <div className="bg-white border rounded-xl p-6 flex flex-col items-center justify-center min-w-[180px] min-h-[110px]">
          <div className="text-6xl font-bold text-gray-900 mb-1">{filteredSoftware.length}</div>
          <div className="text-2xl text-gray-600">Software</div>
        </div>
        <div className="bg-white border rounded-xl p-6 flex flex-col items-center justify-center min-w-[180px] min-h-[110px]">
          <div className="text-6xl font-bold text-gray-900 mb-1">{filteredGroups.length}</div>
          <div className="text-2xl text-gray-600">Groups</div>
        </div>
      </div>

      {/* Collapsible Sections */}
      {renderPreviewTable("Techniques", filteredTechniques, ['id', 'name', 'description'])}
      {renderPreviewTable("Tactics", filteredTactics, ['id', 'name', 'description'])}
      {renderPreviewTable("Mitigations", filteredMitigations, ['id', 'name', 'description'])}
      {renderPreviewTable("Software", filteredSoftware, ['id', 'name', 'description'])}
      {renderPreviewTable("Groups", filteredGroups, ['id', 'name', 'description'])}
    </div>
  );
};

export default MITREAttackMap;
