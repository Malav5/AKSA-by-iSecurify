import React from "react";
import { X, Calendar, User } from "lucide-react";

const RiskDetail = ({ risk, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Risk Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Risk ID and Name */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{risk.name}</h3>
              <p className="text-sm text-gray-500">ID: {risk.id}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  risk.impact === "Critical"
                    ? "bg-red-100 text-red-800"
                    : risk.impact === "High"
                    ? "bg-orange-100 text-orange-800"
                    : risk.impact === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Impact: {risk.impact}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  risk.likelihood === "High"
                    ? "bg-red-100 text-red-800"
                    : risk.likelihood === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Likelihood: {risk.likelihood}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  risk.status === "Mitigated"
                    ? "bg-green-100 text-green-800"
                    : risk.status === "In Progress"
                    ? "bg-blue-100 text-blue-800"
                    : risk.status === "To Do"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {risk.status}
              </span>
            </div>
          </div>

          {/* Risk Score */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Risk Score</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{risk.initialScore}</span>
              <span className="text-sm text-gray-500">/ 25</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Treatment</h4>
              <p className="text-gray-900">{risk.treatment}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Control</h4>
              <p className="text-gray-900">{risk.control}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Owner</h4>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  {risk.owner.charAt(0)}
                </div>
                <p className="text-gray-900">{risk.owner}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Last Action</h4>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{risk.lastAction}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Edit Risk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDetail; 