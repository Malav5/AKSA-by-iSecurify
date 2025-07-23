import React, { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import Pagination from "../../Dashboard/Pagination";
import MoreInfo from "../MoreInfo";
import { fetchActivityLog } from "../../../services/servicedomain";

const WebServer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [webServerData, setWebServerData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState(
    localStorage.getItem("savedDomain") || ""
  );
  const [error, setError] = useState(null);

useEffect(() => {
  if (!domain || domain.trim() === "") {
    console.warn("No domain found. Skipping fetch.");
    return;
  }

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWebServerData(domain);
      console.log("Fetched Web Server Data:", data);
      setWebServerData(data);
    } catch (error) {
      console.error("Error fetching web server data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [domain]);


  // Reset page on data update
  useEffect(() => {
    console.log("Web Server Data State Updated:", webServerData);
    setCurrentPage(1);
  }, [webServerData]);

  const totalItems = webServerData.length;
  const paginatedData = webServerData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDotColor = (text) => {
    const lower = text?.toLowerCase() || "";
    if (lower.includes("missing") || lower.includes("error"))
      return "bg-red-500";
    if (lower.includes("filter") || lower.includes("x-")) return "bg-blue-500";
    return "bg-green-500";
  };

  const levelColor = {
    passed: "text-green-600 bg-green-100",
    warning: "text-yellow-700 bg-yellow-100",
    info: "text-blue-600 bg-blue-100",
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(70vh - 130px)" }}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Web Server Test Results</h2>
      </div>

      <div className="flex-1 overflow-x-auto bg-white border rounded-lg border-gray-200 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-10 text-red-600">
            <span>{error}</span>
          </div>
        ) : totalItems === 0 ? (
          <div className="flex justify-center items-center p-10 text-gray-500">
            <span>No web server data found.</span>
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
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${getDotColor(
                        item.result
                      )}`}
                    ></span>
                    {item.category}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.host}</td>
                  <td className="px-6 py-4 text-gray-700">{item.result}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        levelColor[item.level?.toLowerCase()] ||
                        "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {item.level?.toLowerCase() === "passed"
                        ? "Success"
                        : item.level?.charAt(0).toUpperCase() +
                          item.level?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-blue-600">
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center space-x-1 hover:underline"
                    >
                      <span>More Info</span>
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {showModal && <MoreInfo onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default WebServer;
