import React, { useState, Fragment } from "react";
import { BadgeCheck, Filter, Search, MoreHorizontal, Check, ChevronsUpDown, X } from "lucide-react";
import { Listbox, Transition, Menu } from "@headlessui/react";
import IssueDetail from "./IssueDetail";
import Pagination from "../Pagination";
import UserAssignmentDropdown from "../ui/UserAssignmentDropdown";

const users = ["Unassigned", "Alice", "Bob", "Charlie", "David"];
const levels = ["All", "Low", "Medium", "High", "Critical"];
const statuses = ["All", "Unassigned", "Assigned", "In Progress", "Resolved"];
const policies = ["All", "Free", "Paid"];
const groups = ["All", "TenableFreemium", "AWSInfra", "AzureCloud"];

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
    lastAction: "2025-07-13",
    status: "Unassigned"
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
    lastAction: "2025-07-20",
    status: "Assigned"
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
    lastAction: "2025-07-18",
    status: "In Progress"
  },
  {
    id: "ALL-73",
    agent: "Google Cloud",
    title: "Outdated System Packages",
    level: "Critical",
    group: "AzureCloud",
    policy: "Paid",
    timestamp: "2025-06-22T00:00:00Z",
    devicesAffected: "3 devices affected",
    assignedTo: "Charlie",
    lastAction: "2025-07-15",
    status: "Resolved"
  },
  {
    id: "ALL-74",
    agent: "On-Prem Server",
    title: "Default Credentials Detected",
    level: "High",
    group: "TenableFreemium",
    policy: "Free",
    timestamp: "2025-06-25T00:00:00Z",
    devicesAffected: "1 device affected",
    assignedTo: "Unassigned",
    lastAction: "2025-07-10",
    status: "Unassigned"
  },
];

const getLevelColor = (level) => {
  if (level === "Low") return "bg-green-100 text-green-800";
  if (level === "Medium") return "bg-yellow-100 text-yellow-800";
  if (level === "High") return "bg-orange-100 text-orange-800";
  if (level === "Critical") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const getStatusColor = (status) => {
  if (status === "Unassigned") return "bg-gray-100 text-gray-800";
  if (status === "Assigned") return "bg-blue-100 text-blue-800";
  if (status === "In Progress") return "bg-purple-100 text-purple-800";
  if (status === "Resolved") return "bg-green-100 text-green-800";
  return "bg-gray-100 text-gray-800";
};

const FilterDropdown = ({ label, options, value, onChange }) => {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus-visible:border-[#800080] focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#800080] sm:text-sm">
          <span className="block truncate">{value}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
            {options.map((option, optionIdx) => (
              <Listbox.Option
                key={optionIdx}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-[#800080]/10 text-[#800080]' : 'text-gray-900'
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#800080]">
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default function IssuesTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    level: "All",
    status: "All",
    policy: "All",
    group: "All",
    assignedTo: "All"
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      level: "All",
      status: "All",
      policy: "All",
      group: "All",
      assignedTo: "All"
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredAlerts = staticAlerts.filter((alert) => {
    // Search filter
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Other filters
    const matchesLevel = filters.level === "All" || alert.level === filters.level;
    const matchesStatus = filters.status === "All" || alert.status === filters.status;
    const matchesPolicy = filters.policy === "All" || alert.policy === filters.policy;
    const matchesGroup = filters.group === "All" || alert.group === filters.group;
    const matchesAssignedTo =
      filters.assignedTo === "All" ||
      alert.assignedTo === filters.assignedTo ||
      (filters.assignedTo === "Assigned" && alert.assignedTo !== "Unassigned");

    return (
      matchesSearch &&
      matchesLevel &&
      matchesStatus &&
      matchesPolicy &&
      matchesGroup &&
      matchesAssignedTo
    );
  });

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

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "All"
  ).length + (searchQuery ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-full overflow-hidden border border-gray-100">
      {/* Search & Filter */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative w-full md:w-96 mt-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-[#800080] focus:border-[#800080]"
              placeholder="Search alerts by ID, title or agent..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div>
            <label className="block w-48 text-sm font-medium text-gray-700 mb-1">Criticality</label>
            <FilterDropdown
              label="Level"
              options={levels}
              value={filters.level}
              onChange={(value) => handleFilterChange("level", value)}
            />
          </div>
          <div>
            <label className="block w-48 text-sm font-medium text-gray-700 mb-1">Status</label>
            <FilterDropdown
              label="Status"
              options={statuses}
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
            />
          </div>
          <div>
            <label className="block w-48 text-sm font-medium text-gray-700 mb-1">Policy</label>
            <FilterDropdown
              label="Policy"
              options={policies}
              value={filters.policy}
              onChange={(value) => handleFilterChange("policy", value)}
            />
          </div>
          <div>
            <label className="block w-48 text-sm font-medium text-gray-700 mb-1">Group</label>
            <FilterDropdown
              label="Group"
              options={groups}
              value={filters.group}
              onChange={(value) => handleFilterChange("group", value)}
            />
          </div>
          <div>
            <label className="block w-48 text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <FilterDropdown
              label="Assigned To"
              options={["All", "Assigned", ...users.filter(u => u !== "Unassigned")]}
              value={filters.assignedTo}
              onChange={(value) => handleFilterChange("assignedTo", value)}
            />
          </div>
          {/* <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-[#800080]"
              >
                <X className="h-4 w-4" />
                Clear filters ({activeFilterCount})
              </button>
            )}
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white rounded-lg text-sm font-medium shadow hover:from-[#700070] hover:to-[#d17ad1] transition"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-white text-[#800080] rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
          </div> */}
        </div>


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
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedAlert(alert)}
              >
                <td className="px-4 py-3 font-medium text-primary flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {alert.id}
                </td>
                <td className="px-4 py-3 text-gray-700 group-hover:text-[#800080] font-semibold transition-colors">
                  {alert.title}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${getLevelColor(alert.level)}`}>
                    {alert.level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{alert.agent}</td>
                <td className="px-4 py-3 text-gray-600">{alert.devicesAffected}</td>
                <td className="px-4 py-3 text-gray-600">{alert.policy}</td>
                <td className="px-4 py-3 text-gray-600">{alert.group}</td>
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
                  No issues found matching your filters.
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