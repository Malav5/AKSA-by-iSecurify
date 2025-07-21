import React, { useRef, useState, useEffect } from 'react';
import { Listbox } from '@headlessui/react';

const pageSizes = [10, 20, 50];

const AlertsTable = ({ paginatedFilteredAlerts, filteredAlerts, pageSize, handlePageSizeChange, currentPage, totalPages, goToPage, setSelectedAlert, severityConfig }) => {
  const listboxButtonRef = useRef(null);
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    const handlePosition = () => {
      if (!listboxButtonRef.current) return;
      const rect = listboxButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 250px below and more above, open upwards
      setDropUp(spaceBelow < 250 && spaceAbove > 250);
    };
    handlePosition();
    window.addEventListener('resize', handlePosition);
    window.addEventListener('scroll', handlePosition, true);
    return () => {
      window.removeEventListener('resize', handlePosition);
      window.removeEventListener('scroll', handlePosition, true);
    };
  }, []);

  return (
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
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">Title</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 overflow-hidden truncate max-w-[8rem]" title={alert.id}>{alert.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 overflow-hidden truncate max-w-[20rem]" title={alert.title}>{alert.title}</td>
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
        {/* Rows per page selector left-aligned, now using Headless UI Listbox */}
        <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0">
          <span className="mr-2">Rows per page:</span>
          <Listbox value={pageSize} onChange={value => handlePageSizeChange({ target: { value } })}>
            <div className="relative w-24">
              <Listbox.Button ref={listboxButtonRef} className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-1 pl-3 pr-8 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                {pageSize}
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </Listbox.Button>
              <Listbox.Options className={`absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base focus:outline-none sm:text-sm ${dropUp ? 'bottom-full mb-1' : 'mt-1'}`}>
                {pageSizes.map((size) => (
                  <Listbox.Option
                    key={size}
                    value={size}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{size}</span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
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
};

export default AlertsTable; 