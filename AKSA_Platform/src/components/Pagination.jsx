import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 20, 50],
  totalItems
}) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 py-4 bg-white rounded-b-xl border-t border-gray-100">
      <div className="flex items-center jusfity-between gap-2">
        <span className="text-gray-700 font-medium">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={e => onRowsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
        >
          {rowsPerPageOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="text-gray-800 font-semibold text-base">
          {currentPage} / {totalPages}
        </span>
        <button
          className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
