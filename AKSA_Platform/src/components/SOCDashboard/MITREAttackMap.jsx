import React, { useEffect, useState } from 'react';
import {
  ShieldAlert, Lock, LogIn, HelpCircle, ChevronDown, ChevronUp,
  Zap, Target, Shield, Cpu, Users
} from 'lucide-react';
import PropTypes from 'prop-types';
import { fetchMitreData, fetchAssignedAgents } from '../../services/SOCservices';

const MITREAttackMap = ({ topRules }) => {
  const [mitreData, setMitreData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);
  const [assignedAgents, setAssignedAgents] = useState([]);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');

  // Enhanced tactic mapping with better visual hierarchy
  const tacticMap = {
    ssh: {
      name: 'Initial Access',
      color: 'bg-primary/10 border border-primary/20 text-primary',
      icon: <LogIn size={18} className="text-primary" />
    },
    login: {
      name: 'Credential Access',
      color: 'bg-amber-50 border border-amber-100 text-amber-700',
      icon: <Lock size={18} className="text-amber-500" />
    },
    brute: {
      name: 'Brute Force',
      color: 'bg-orange-50 border border-orange-100 text-orange-700',
      icon: <Zap size={18} className="text-orange-500" />
    },
    privilege: {
      name: 'Privilege Escalation',
      color: 'bg-red-50 border border-red-100 text-red-700',
      icon: <ShieldAlert size={18} className="text-red-500" />
    },
    default: {
      name: 'Other Tactics',
      color: 'bg-gray-50 border border-gray-100 text-gray-700',
      icon: <HelpCircle size={18} className="text-gray-500" />
    },
  };

  useEffect(() => {
    const getMitreData = async () => {
      try {
        setLoading(true);
        const data = await fetchMitreData();
        setMitreData(data);
      } catch (err) {
        console.error('Failed to fetch MITRE data:', err);
        setError('Failed to load MITRE ATT&CK mapping data');
      } finally {
        setLoading(false);
      }
    };
    getMitreData();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      setUserRole(role);
      if (role === 'subadmin') {
        setAssignedAgents([]); // Admin sees all
      } else {
        const userEmail = localStorage.getItem('soc_email');
        if (!userEmail) {
          setAssignedAgents([]);
          return;
        }
        const agents = await fetchAssignedAgents(userEmail, token);
        setAssignedAgents(agents.map(a => a.agentName || a.name));
      }
    };
    fetchAgents();
  }, []);


  // Extract MITRE IDs from alert descriptions
  const extractMitreIds = () => {
    const mitreIdRegex = /(T\d{4}|G\d{4}|S\d{4}|M\d{4})/gi;
    const ids = new Set();
    topRules.forEach(([desc]) => {
      const matches = desc.match(mitreIdRegex);
      if (matches) matches.forEach(id => ids.add(id.toUpperCase()));
    });
    return ids;
  };

  // Filter topRules for assigned agents (if not admin)
  const filteredTopRules = userRole === 'subadmin'
    ? topRules
    : topRules.filter(([desc, count, agentName]) =>
      assignedAgents.length === 0 || assignedAgents.includes(agentName)
    );

  // Extract MITRE IDs from filtered topRules
  const alertMitreIds = (() => {
    const mitreIdRegex = /(T\d{4}|G\d{4}|S\d{4}|M\d{4})/gi;
    const ids = new Set();
    filteredTopRules.forEach(([desc]) => {
      const matches = desc.match(mitreIdRegex);
      if (matches) matches.forEach(id => ids.add(id.toUpperCase()));
    });
    return ids;
  })();

  // Filter MITRE data by found IDs
  const filterMitreData = (arr) => (arr || []).filter(item =>
    alertMitreIds.has(item.id?.toUpperCase())
  );

  // Filtered MITRE data
  const filteredTechniques = filterMitreData(mitreData.techniques);
  const filteredTactics = filterMitreData(mitreData.tactics);
  const filteredMitigations = filterMitreData(mitreData.mitigations);
  const filteredSoftware = filterMitreData(mitreData.software);
  const filteredGroups = filterMitreData(mitreData.groups);

  // Map rules to tactics with counts
  const tacticDistribution = filteredTopRules.reduce((acc, [desc]) => {
    const key = Object.keys(tacticMap).find(k => desc.toLowerCase().includes(k));
    const tactic = tacticMap[key] || tacticMap.default;
    acc[tactic.name] = (acc[tactic.name] || { ...tactic, count: 0 });
    acc[tactic.name].count += 1;
    return acc;
  }, {});

  const sortedTactics = Object.values(tacticDistribution).sort((a, b) => b.count - a.count);

  // Summary card component
  const SummaryCard = ({ icon, value, label }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-primary">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-lg text-gray-600 mt-1">{label}</div>
    </div>
  );

  // Collapsible section component
  const CollapsibleSection = ({ title, items, icon, fields = ['id', 'name'] }) => {
    const isExpanded = expanded === title;
    const hasItems = items?.length > 0;

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div
          className={`flex justify-between items-center p-4 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
          onClick={() => setExpanded(isExpanded ? null : title)}
        >
          <div className="flex items-center">
            <div className="mr-3 text-primary">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-800">
              {title} <span className="text-gray-500">({items?.length || 0})</span>
            </h3>
          </div>
          {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
        </div>

        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            {hasItems ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {fields.map(f => (
                        <th key={f} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {f}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.slice(0, 10).map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {fields.map(f => (
                          <td key={f} className="px-4 py-3 whitespace-nowrap">
                            {f === 'name' && item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {item[f]}
                              </a>
                            ) : (
                              <span className="text-gray-700">
                                {item[f] || '-'}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length > 10 && (
                  <div className="mt-2 text-sm text-gray-500 text-center">
                    Showing first 10 of {items.length} items
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No {title.toLowerCase()} found in current alerts
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <ShieldAlert className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">MITRE ATT&CK Mapping</h2>
        </div>
        <p className="text-gray-600">
          This visualization maps detected security alerts to the MITRE ATT&CK framework,
          helping identify adversary tactics, techniques, and procedures (TTPs).
        </p>
      </div>

      {/* Tactic Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tactic Distribution</h3>
        <div className="flex flex-wrap gap-3">
          {sortedTactics.map((tactic, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${tactic.color} transition-all hover:shadow-sm`}
            >
              {tactic.icon}
              <span className="font-medium">{tactic.name}</span>
              <span className="ml-1 text-gray-600">({tactic.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <SummaryCard
          icon={<Zap className="w-5 h-5 text-primary" />}
          value={filteredTechniques.length}
          label="Techniques"
        />
        <SummaryCard
          icon={<Target className="w-5 h-5 text-primary" />}
          value={filteredTactics.length}
          label="Tactics"
        />
        <SummaryCard
          icon={<Shield className="w-5 h-5 text-primary" />}
          value={filteredMitigations.length}
          label="Mitigations"
        />
        <SummaryCard
          icon={<Cpu className="w-5 h-5 text-primary" />}
          value={filteredSoftware.length}
          label="Software"
        />
        <SummaryCard
          icon={<Users className="w-5 h-5 text-primary" />}
          value={filteredGroups.length}
          label="Groups"
        />
      </div>

      {/* Detailed Sections */}
      <CollapsibleSection
        title="Techniques"
        items={filteredTechniques}
        icon={<Zap className="w-5 h-5" />}
        fields={['id', 'name', 'description']}
      />
      <CollapsibleSection
        title="Tactics"
        items={filteredTactics}
        icon={<Target className="w-5 h-5" />}
        fields={['id', 'name']}
      />
      <CollapsibleSection
        title="Mitigations"
        items={filteredMitigations}
        icon={<Shield className="w-5 h-5" />}
        fields={['id', 'name']}
      />
      <CollapsibleSection
        title="Software"
        items={filteredSoftware}
        icon={<Cpu className="w-5 h-5" />}
        fields={['id', 'name']}
      />
      <CollapsibleSection
        title="Groups"
        items={filteredGroups}
        icon={<Users className="w-5 h-5" />}
        fields={['id', 'name']}
      />
    </div>
  );
};

MITREAttackMap.propTypes = {
  topRules: PropTypes.arrayOf(PropTypes.array).isRequired
};

export default MITREAttackMap;