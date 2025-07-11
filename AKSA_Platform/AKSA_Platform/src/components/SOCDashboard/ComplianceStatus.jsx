import React, { useState, useEffect } from 'react';
import { getComplianceStatus, fetchAlertSeverityChartData } from '../../services/SOCservices';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { CheckCircle, AlertCircle, Info, ChevronRight } from 'lucide-react';

const ComplianceStatus = ({ targetScore = 90 }) => {
  const [compliancePct, setCompliancePct] = useState(0);
  const [lastAudit, setLastAudit] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Get compliance level with improved visual hierarchy
  const getComplianceLevel = (percentage) => {
    if (percentage >= 90) return { 
      label: 'Excellent', 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      gradient: 'from-emerald-400 to-emerald-500'
    };
    if (percentage >= 75) return { 
      label: 'Good', 
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      icon: <CheckCircle className="w-5 h-5 text-teal-500" />,
      gradient: 'from-teal-400 to-teal-500'
    };
    if (percentage >= 50) return { 
      label: 'Needs Improvement', 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      gradient: 'from-amber-400 to-amber-500'
    };
    return { 
      label: 'Critical', 
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      gradient: 'from-rose-400 to-rose-500'
    };
  };

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setIsLoading(true);
        const severityData = await fetchAlertSeverityChartData();
        const labels = severityData.labels || [];
        const data = (severityData.datasets && severityData.datasets[0]?.data) || [];
        
        let total = 0;
        let highSeverity = 0;
        
        labels.forEach((label, idx) => {
          const level = parseInt(label.replace(/[^0-9]/g, ''));
          const count = data[idx] || 0;
          total += count;
          if (level >= 7) highSeverity += count;
        });

        if (total === 0) {
          setStatusMessage("No alerts found. Compliance cannot be calculated.");
        } else if (highSeverity === 0) {
          setStatusMessage("No high-severity alerts found. Compliance shows 100%.");
        } else {
          setStatusMessage("");
        }

        const pct = total ? Math.round(((total - highSeverity) / total) * 100) : 0;
        
        // Animate the percentage
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

        // Set last audit time
        setLastAudit(new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }));
      } catch (err) {
        console.error('Error fetching compliance data:', err);
        setStatusMessage("Failed to load compliance data. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchComplianceData();
  }, []);

  const complianceLevel = getComplianceLevel(compliancePct);
  const targetDiff = compliancePct - targetScore;
  const isMeetingTarget = compliancePct >= targetScore;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${complianceLevel.bgColor} ${complianceLevel.borderColor} border`}>
                {complianceLevel.icon}
              </div>
              Compliance Status
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Last audited: <span className="font-medium">{lastAudit || '--'}</span>
            </p>
          </div>
          
          {isLoading ? (
            <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          ) : (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${complianceLevel.bgColor} ${complianceLevel.borderColor} border ${complianceLevel.color}`}>
              {complianceLevel.label}
            </span>
          )}
        </div>

        {/* Score Display */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Compliance</p>
              <div className="text-4xl font-bold text-gray-800">
                {compliancePct}%
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Target</p>
              <div className={`text-xl font-semibold ${isMeetingTarget ? 'text-emerald-600' : 'text-amber-600'}`}>
                {targetScore}%
              </div>
              {!isLoading && (
                <p className={`text-xs mt-1 ${isMeetingTarget ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isMeetingTarget ? (
                    <span className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> 
                      {Math.abs(targetDiff)}% above target
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {Math.abs(targetDiff)}% below target
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${compliancePct}%` }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className={`h-full bg-gradient-to-r ${complianceLevel.gradient} rounded-full`}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Details Toggle */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <span className="flex items-center">
            <Info className="w-4 h-4 mr-2 text-gray-400" />
            How is this calculated?
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600 mb-2">
            Compliance is calculated based on the ratio of total alerts to medium, high, 
            and critical severity alerts (level ≥ 7).
          </p>
          <p className="text-sm text-gray-600">
            Formula: <code className="bg-gray-200 px-1 rounded">(Total Alerts - High Severity Alerts) / Total Alerts</code>
          </p>
          
          {statusMessage && (
            <div className={`mt-3 p-2 rounded text-sm ${statusMessage.includes("100%") ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
              <Info className="inline w-4 h-4 mr-1" />
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

ComplianceStatus.propTypes = {
  targetScore: PropTypes.number
};

export default ComplianceStatus;