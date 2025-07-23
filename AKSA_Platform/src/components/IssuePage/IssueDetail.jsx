import React from "react";
import { X } from "lucide-react";

const IssueDetail = ({ risk, onClose }) => {
  if (!risk) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl w-full mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Alert Detail</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Alert ID</h4>
            <p className="text-gray-900">{risk.id}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Agent</h4>
            <p className="text-gray-900">{risk.agent}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Title</h4>
            <p className="text-gray-900">{risk.title}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.description}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Remediation</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.remediation}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Level</h4>
            <p className="text-gray-900">{risk.level}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Group</h4>
            <p className="text-gray-900">{risk.group}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">MITRE Techniques</h4>
            <p className="text-gray-900">{risk.mitreTechniques?.join(", ") || "None"}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Compliance</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.compliance || "Not Available"}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Commands</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.commands?.join("\n") || "N/A"}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Timestamp</h4>
            <p className="text-gray-900">{new Date(risk.timestamp).toLocaleString()}</p>
          </div>
        </div>

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
            Edit Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
