import React, { useState } from "react";
import { BadgeCheck, Filter, Search, MoreHorizontal } from "lucide-react";
import IssueDetail from "./IssueDetail";
import Pagination from "../Pagination";

const users = ["Unassigned", "Alice", "Bob", "Charlie", "David"];

const staticAlerts = [
  {
    id: "ALL-70",
    agent: "Allianz Cloud",
    title: "ICMP Timestamp Request Remote...",
    level: "Low",
    group: "TenableFreemium",
    policy: "Free",
    timestamp: "2025-06-15T00:00:00Z",
    devicesAffected: "0 devices affected",
    assignedTo: "Unassigned",
    lastAction: "2025-07-13"
  },
  {
    id: "ALL-71",
    agent: "Azure VM",
    title: "Weak SSL Cipher Detected",
    level: "Medium",
    group: "TenableFreemium",
    policy: "Free",
    timestamp: "2025-06-18T00:00:00Z",
    devicesAffected: "2 devices affected",
    assignedTo: "Alice",
    lastAction: "2025-07-20"
  },
  {
    id: "ALL-72",
    agent: "AWS EC2",
    title: "Open FTP Port Detected",
    level: "High",
    group: "AWSInfra",
    policy: "Paid",
    timestamp: "2025-06-20T00:00:00Z",
    devicesAffected: "1 device affected",
    assignedTo: "Bob",
    lastAction: "2025-07-18"
  },
  {
    id: "ALL-73",
    agent: "Google Cloud",
    title: "Apache Version Disclosure",
    level: "Low",
    group: "GCP Default",
    policy: "Free",
    timestamp: "2025-06-25T00:00:00Z",
    devicesAffected: "3 devices affected",
    assignedTo: "Charlie",
    lastAction: "2025-07-21"
  },
  {
    id: "ALL-74",
    agent: "On-prem Server",
    title: "SMB Signing Not Required",
    level: "Medium",
    group: "InternalAudit",
    policy: "Free",
    timestamp: "2025-06-30T00:00:00Z",
    devicesAffected: "5 devices affected",
    assignedTo: "David",
    lastAction: "2025-07-22"
  },
  {
    id: "ALL-75",
    agent: "Kubernetes Cluster",
    title: "Anonymous Bind in LDAP Allowed",
    level: "High",
    group: "KubeSecOps",
    policy: "Enterprise",
    timestamp: "2025-07-01T00:00:00Z",
    devicesAffected: "4 devices affected",
    assignedTo: "Unassigned",
    lastAction: "2025-07-23"
  }
];


const getLevelColor = (level) => {
  if (level === "Low") return "bg-green-100 text-green-800";
  if (level === "Medium") return "bg-yellow-100 text-yellow-800";
  if (level === "High") return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

export default function IssuesTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredAlerts = staticAlerts.filter(
    (alert) =>
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.agent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignUser = (alertId, user) => {
    setAssignments((prev) => ({
      ...prev,
      [alertId]: user,
    }));
  };
  const totalPages = Math.ceil(filteredAlerts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentAlerts = filteredAlerts.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-full overflow-hidden">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="text-sm uppercase bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-5">Issue ID</th>
              <th className="px-4 py-5">Issue name</th>
              <th className="px-4 py-5">Criticality</th>
              <th className="px-4 py-5">Status</th>
              <th className="px-4 py-5">Member</th>
              <th className="px-4 py-5">Device info</th>
              <th className="px-4 py-5">Solution</th>
              <th className="px-4 py-5">Partner</th>
              <th className="px-4 py-5">Assigned to</th>
              <th className="px-4 py-5">Created on</th>
              <th className="px-4 py-5">Last action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedAlert(alert)}
              >
                <td className="px-4 py-3 font-medium text-primary flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {alert.id}
                </td>
                <td className="px-4 py-3 text-gray-600">{alert.title}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getLevelColor(alert.level)}`}>
                    {alert.level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {alert.assignedTo}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{alert.agent}</td>
                <td className="px-4 py-3 text-gray-600">{alert.devicesAffected}</td>
                <td className="px-4 py-3 text-gray-600">{alert.policy}</td>
                <td className="px-4 py-3 text-gray-600">{alert.group}</td>
                <td className="px-4 py-3">
                  <select
                    className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1"
                    value={assignments[alert.id] || alert.assignedTo}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleAssignUser(alert.id, e.target.value)}
                  >
                    {users.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(alert.timestamp).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-gray-600">{alert.lastAction}</td>
              </tr>
            ))}
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  No issues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        totalItems={filteredAlerts.length}
      />

      {/* Alert Detail Modal (Optional if needed) */}
      {selectedAlert && (
        <IssueDetail risk={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
