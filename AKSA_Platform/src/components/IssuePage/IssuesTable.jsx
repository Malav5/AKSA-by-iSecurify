import React, { useState, Fragment } from "react";
import { BadgeCheck, Filter, Search, MoreHorizontal, Check, ChevronsUpDown } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import IssueDetail from "./IssueDetail";
import Pagination from "../Pagination";
import UserAssignmentDropdown from "../ui/UserAssignmentDropdown";
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
    <div className="bg-white rounded-2xl shadow p-6 max-w-full overflow-hidden border border-gray-100">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-[#800080] focus:border-[#800080]"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white rounded-lg text-sm font-medium shadow hover:from-[#700070] hover:to-[#d17ad1] transition">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
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
            {currentAlerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-t border-gray-200 hover:bg-[#f9ecf9] transition-colors cursor-pointer group"
                onClick={() => setSelectedAlert(alert)}
              >
                <td className="px-4 py-3 font-medium text-primary flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {alert.id}
                </td>
                <td className="px-4 py-3 text-gray-700 group-hover:text-[#800080] font-semibold transition-colors">{alert.title}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${getLevelColor(alert.level)}`}>
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
                {/* Headless UI Dropdown */}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <UserAssignmentDropdown
                    users={users}
                    value={assignments[alert.id] || alert.assignedTo}
                    onChange={(val) => handleAssignUser(alert.id, val)}
                  />
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

      {selectedAlert && (
        <IssueDetail risk={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
