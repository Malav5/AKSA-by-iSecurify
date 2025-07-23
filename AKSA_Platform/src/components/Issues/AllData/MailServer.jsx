import React, { useState, useEffect } from "react";
import Pagination from "../../Dashboard/Pagination";
import { fetchMxRecords } from "../../../services/servicedomain";
import { Loader2 } from "lucide-react";

const MailServer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [mxRecords, setMxRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const [domain, setDomain] = useState(
    localStorage.getItem("savedDomain") || ""
  );

  useEffect(() => {
    if (!domain) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMxRecords(domain);
        setMxRecords(data);
      } catch (error) {
        setMxRecords([{ error: "Failed to fetch MX records." }]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [domain]);

  const totalItems = mxRecords.length;
  const paginatedData = mxRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className="flex flex-col scrollbar-hide"
      style={{ height: "calc(70vh - 130px)" }}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mail Servers (MX Records)</h2>
      </div>

      <div className="flex-1 overflow-x-auto bg-white border rounded-lg border-gray-200 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : mxRecords[0]?.error ? (
          <div className="p-4 text-red-500">
            <strong>{mxRecords[0].error}</strong>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Preference
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Hostname
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  TTL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-gray-900">
                    {record.preference}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{record.hostname}</td>
                  <td className="px-6 py-4 text-gray-700">{record.ip}</td>
                  <td className="px-6 py-4 text-gray-700">{record.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default MailServer;
