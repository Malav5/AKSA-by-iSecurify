import React from 'react';

const AlertsTable = ({ paginatedFilteredAlerts, filteredAlerts, pageSize, handlePageSizeChange, currentPage, totalPages, goToPage, setSelectedAlert, severityConfig }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Alert Details ({filteredAlerts.length.toLocaleString()} filtered)
        </h3>
      </div>
    </div>
    <div className="overflow-x-auto">
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedFilteredAlerts.length > 0 ? (
              paginatedFilteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alert.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${severityConfig[alert.severity].color}`}>{alert.severity}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.agentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No alerts found matching your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    {/* Pagination - Centered, modern style as in image */}
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white rounded-b-xl">
      {/* Rows per page selector left-aligned */}
      <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0">
        <span className="mr-2">Rows per page:</span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      {/* Centered pagination controls */}
      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-2 px-4 py-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-200 hover:scale-105"
          >
            Prev
          </button>
          <span className="text-gray-700 text-base font-semibold min-w-[60px] text-center">{currentPage} / {totalPages}</span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-200 hover:scale-105"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AlertsTable; 