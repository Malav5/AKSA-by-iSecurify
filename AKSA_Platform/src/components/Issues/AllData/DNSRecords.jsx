import React, { useState, useEffect } from "react";
import Pagination from "../../Dashboard/Pagination";
import { fetchDNSData } from "../../../services/servicedomain";
import { Loader2 } from "lucide-react"; // Spinner icon from lucide-react

const DNSRecords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dnsData, setDNSData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [domain, setDomain] = useState(
    localStorage.getItem("savedDomain") || "forensiccybertech.com"
  );
  const itemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchDNSData(domain);
        setDNSData(data);
      } catch (error) {
        console.error("Error fetching DNS data:", error);
      } finally {
        setLoading(false); // Done loading
      }
    };
    loadData();
  }, [domain]);

  const filteredRecords = dnsData.filter(
    (record) =>
      record.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredRecords.length;
  const paginatedData = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const levelColor = {
    passed: "text-green-600 bg-green-100",
    warning: "text-yellow-700 bg-yellow-100",
    info: "text-blue-600 bg-blue-100",
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(70vh - 130px)" }}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">DNS Records</h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by host or result"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 border rounded"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto bg-white border rounded-lg border-gray-200 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Host
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Result
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 text-gray-700">{item.host}</td>
                  <td className="px-6 py-4 text-gray-700">{item.result}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        levelColor[item.level.toLowerCase()] ||
                        "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {item.level.toLowerCase() === "passed"
                        ? "Success"
                        : item.level.charAt(0).toUpperCase() +
                          item.level.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default DNSRecords;
