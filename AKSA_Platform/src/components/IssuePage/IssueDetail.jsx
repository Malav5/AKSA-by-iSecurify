import React from "react";
import { X } from "lucide-react";

const IssueDetail = ({ risk, onClose }) => {
  if (!risk) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-8 max-w-5xl w-full mx-4 overflow-y-auto max-h-[90vh] scrollbar-hide">
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
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Alert ID</h4>
            <p className="text-gray-900 font-mono">{risk.id}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Agent</h4>
            <p className="text-gray-900">{risk.agent}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Title</h4>
            <p className="text-gray-900 font-semibold text-lg">{risk.title}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Description</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.description}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Remediation</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.remediation}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Level</h4>
            <p className="text-gray-900 font-bold">{risk.level}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Group</h4>
            <p className="text-gray-900">{risk.group}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">MITRE Techniques</h4>
            <p className="text-gray-900">{risk.mitreTechniques?.join(", ") || "None"}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Compliance</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.compliance || "Not Available"}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Commands</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{risk.commands?.join("\n") || "N/A"}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Timestamp</h4>
            <p className="text-gray-900">{new Date(risk.timestamp).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Close
          </button>
          <button
            className="px-5 py-2 text-white bg-gradient-to-r from-[#800080] to-[#ee8cee] rounded-lg hover:from-[#700070] hover:to-[#d17ad1] transition-colors font-semibold shadow"
          >
            Edit Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
