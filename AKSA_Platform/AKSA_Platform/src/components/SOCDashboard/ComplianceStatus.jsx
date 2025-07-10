import React, { useState, useEffect } from 'react';
import { getComplianceStatus, fetchAlertSeverityChartData } from '../../services/SOCservices';
import { motion } from 'framer-motion';

const getComplianceLevel = (percentage) => {
  if (percentage >= 90) return { 
    label: 'Excellent', 
    color: 'emerald', 
    badge: 'bg-emerald-100 text-emerald-800',
    gradient: 'from-emerald-400 to-emerald-600'
  };
  if (percentage >= 75) return { 
    label: 'Good', 
    color: 'lime', 
    badge: 'bg-lime-100 text-lime-800',
    gradient: 'from-lime-400 to-lime-600'
  };
  if (percentage >= 50) return { 
    label: 'Needs Improvement', 
    color: 'amber', 
    badge: 'bg-amber-100 text-amber-800',
    gradient: 'from-amber-400 to-amber-600'
  };
  return { 
    label: 'Critical', 
    color: 'rose', 
    badge: 'bg-rose-100 text-rose-800',
    gradient: 'from-rose-400 to-rose-600'
  };
};

const ComplianceStatus = () => {
  const [compliancePct, setCompliancePct] = useState(0);
  const [lastAudit, setLastAudit] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [alertDebug, setAlertDebug] = useState("");

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        // Use real-time severity aggregation
        const severityData = await fetchAlertSeverityChartData();
        const labels = severityData.labels || [];
        const data = (severityData.datasets && severityData.datasets[0]?.data) || [];
        let total = 0;
        let highSeverity = 0;
        labels.forEach((label, idx) => {
          const level = parseInt(label.replace(/[^0-9]/g, ''));
          const count = data[idx] || 0;
          total += count;
          if (level >= 7) highSeverity += count; // Medium, High, Critical
        });
        if (total === 0) {
          setAlertDebug("No alerts found. Compliance cannot be calculated.");
        } else if (highSeverity === 0) {
          setAlertDebug("No high-severity alerts found. Compliance will always show 100%.");
        } else {
          setAlertDebug("");
        }
        const pct = total ? Math.round(((total - highSeverity) / total) * 100) : 0;
        // Animate the percentage increase
        let start = 0;
        const duration = 1500;
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentPct = Math.floor(progress * pct);
          setCompliancePct(currentPct);
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setIsLoading(false);
          }
        };
        animate();
        const now = new Date();
        setLastAudit(now.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }));
      } catch (err) {
        console.error('Error fetching compliance alerts:', err);
        setIsLoading(false);
      }
    };
    fetchComplianceData();
  }, []);

  const { label, color, badge, gradient } = getComplianceLevel(compliancePct);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-xl rounded-xl p-6 mb-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Compliance Status
          </h3>
          <p className="text-sm text-gray-500">Last audited on: {lastAudit}</p>
        </div>
        {isLoading ? (
          <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        ) : (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge}`}>
            {label}
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-sm text-gray-500">Current Score</span>
            <div className="text-4xl font-bold text-gray-800">
              {compliancePct}%
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Target</span>
            <div className="text-xl font-semibold text-gray-700">90%</div>
          </div>
        </div>

        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${compliancePct}%` }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Compliance is calculated based on the ratio of total alerts to medium, high, and critical severity alerts (level ≥ 7).
        {alertDebug && (
          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
            <strong>Debug:</strong> {alertDebug}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ComplianceStatus;