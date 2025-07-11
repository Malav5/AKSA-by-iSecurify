import React, { useState, useEffect } from "react";
import { BadgeCheck, Filter, Search, MoreHorizontal } from "lucide-react";
import IssueDetail from "./IssueDetail";
import Pagination from "../Pagination";
import { fetchPaginatedAlerts } from "../../services/SOCservices";

const ITEMS_PER_PAGE = 5;

const getLevelColor = (level) => {
  if (level >= 7) return "bg-red-100 text-red-800";
  if (level >= 5) return "bg-orange-100 text-orange-800";
  if (level >= 3) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

// Sample user list (you can fetch this from your API instead)
const users = ["Unassigned", "Alice", "Bob", "Charlie", "David"];

export default function IssuesTable() {
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignments, setAssignments] = useState({}); // Store assignments per alert ID

  const fetchData = async () => {
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const size = ITEMS_PER_PAGE;
    const data = await fetchPaginatedAlerts(from, size);
    if (data?.hits?.hits) {
      const mapped = data.hits.hits.map((item) => {
        const src = item._source;
        return {
          id: item._id,
          agent: src.agent?.name || "Unknown",
          ruleId: src.rule?.id || "N/A",
          level: src.rule?.level || 0,
          title: src.data?.sca?.check?.title || src.rule?.description || "No Title",
          description: src.data?.sca?.check?.description || "No Description",
          result: src.data?.sca?.check?.result || "unknown",
          remediation: src.data?.sca?.check?.remediation || "Not Provided",
          policy: src.data?.sca?.policy || "N/A",
          mitreTactics: src.rule?.mitre_tactics || [],
          mitreTechniques: src.rule?.mitre_techniques || [],
          timestamp: src.timestamp || new Date().toISOString(),
          group: src.rule?.groups?.[0] || "N/A"
        };
      });
      setAlerts(mapped);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const filteredAlerts = alerts.filter((alert) =>
    alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.agent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(10000 / ITEMS_PER_PAGE); // Assumed total

  const handleAssignUser = (alertId, user) => {
    setAssignments(prev => ({
      ...prev,
      [alertId]: user
    }));
  };

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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
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
              <th className="px-4 py-5">Alert ID</th>
              <th className="px-4 py-5">Agent</th>
              <th className="px-4 py-5">Title</th>
              <th className="px-4 py-5">Assigned To</th>
              <th className="px-4 py-5">Level</th>
              <th className="px-4 py-5">Group</th>
              <th className="px-4 py-5">Policy</th>
              <th className="px-4 py-5">Timestamp</th>
              <th className="px-4 py-5 sr-only">Actions</th>
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
                <td className="px-4 py-3 text-gray-600">{alert.agent}</td>
                <td className="px-4 py-3 font-medium">{alert.title}</td>

                {/* Assigned To dropdown */}
                <td className="px-4 py-3">
                  <select
                    className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1"
                    value={assignments[alert.id] || "Unassigned"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleAssignUser(alert.id, e.target.value)}
                  >
                    {users.map((user) => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getLevelColor(alert.level)}`}
                  >
                    {alert.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{alert.group}</td>
                <td className="px-4 py-3 text-gray-600">{alert.policy}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(alert.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlert(alert);
                    }}
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  No alerts found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAlerts.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <IssueDetail risk={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
