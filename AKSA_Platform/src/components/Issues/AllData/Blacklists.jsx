import React, { useState, useEffect } from "react";
import Pagination from "../../Dashboard/Pagination";
import { fetchBlacklistData } from "../../../services/servicedomain";
import MoreInfo from "../MoreInfo";
import { Loader2 } from "lucide-react"; // For the spinner icon

const Blacklists = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [blacklists, setBlacklists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const itemsPerPage = 5;
  const [domain, setDomain] = useState(
    localStorage.getItem("savedDomain") || ""
  );

  useEffect(() => {
    if (!domain) return;

    const getBlacklistData = async () => {
      setLoading(true); // Show loader when fetching
      try {
        const data = await fetchBlacklistData(domain);
        const mappedData = data.map((entry, index) => ({
          id: index,
          category: entry.category,
          domain: entry.domain,
          blacklistName: entry.blacklistName,
        }));
        setBlacklists(mappedData);
      } catch (error) {
        console.error("Error fetching blacklist data:", error);
      } finally {
        setLoading(false); // Hide loader after fetching is done
      }
    };

    getBlacklistData();
  }, [domain]);

  const totalItems = blacklists.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = blacklists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className="flex flex-col scrollbar-hide"
      style={{ height: "calc(70vh - 130px)" }}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blacklists</h2>
      </div>

      <div className="flex-1 overflow-x-auto bg-white border rounded-lg border-gray-200 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-10 w-10 animate-spin text-[#800080]" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Blacklist Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.domain}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.blacklistName}
                  </td>
                  <td className="py-4">
                    <button
                      className="px-5 text-blue-500 text-sm"
                      onClick={() => setShowModal(true)}
                    >
                      More Info
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

export default Blacklists;
