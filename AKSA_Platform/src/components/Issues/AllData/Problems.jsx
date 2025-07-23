import React, { useState, useEffect } from "react";
import Pagination from "../../Dashboard/Pagination";
import { fetchDomainProblems } from "../../../services/servicedomain";
import { Loader2 } from "lucide-react"; // For the spinner icon

const Problems = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const itemsPerPage = 5;
  const [domain, setDomain] = useState(
    localStorage.getItem("savedDomain") || ""
  );

  useEffect(() => {
    if (!domain) return;

    const getDomainData = async () => {
      setLoading(true); // Show loader when fetching
      try {
        const data = await fetchDomainProblems(domain); // Use dynamic domain
        const mappedProblems = data.map((problem) => ({
          id: problem.category + "-" + problem.host,
          category: problem.category.toUpperCase(),
          host: problem.host,
          result: problem.result,
          severity: mapSeverity(problem.level),
        }));
        setProblems(mappedProblems);
      } catch (error) {
        console.error("Error fetching problems:", error);
      } finally {
        setLoading(false); // Hide loader after fetching is done
      }
    };

    getDomainData();
  }, [domain]); // Fetch again if domain changes

  const mapSeverity = (level) => {
    switch (level) {
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      case "success":
        return "Success";
      default:
        return "Unknown";
    }
  };

  const totalItems = problems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = problems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className="flex flex-col scrollbar-hide"
      style={{ height: "calc(70vh - 130px)" }}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Problems</h2>
      </div>

      <div className="flex-1 overflow-x-auto bg-white border rounded-lg border-gray-200 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((problem) => (
                <tr key={problem.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {problem.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {problem.host}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {problem.result}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        problem.severity === "Error"
                          ? "bg-red-100 text-red-800"
                          : problem.severity === "Warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {problem.severity}
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

export default Problems;
