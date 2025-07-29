import React, { useEffect, useRef, useState } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 20, 50],
  totalItems
}) {
  const listboxRef = useRef(null);
  const [dropUp, setDropUp] = useState(false);

  // Auto position dropdown above if not enough space
  useEffect(() => {
    const checkPosition = () => {
      if (listboxRef.current) {
        const rect = listboxRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < 200); // adjust threshold as needed
      }
    };

    checkPosition();
    window.addEventListener("resize", checkPosition);
    return () => window.removeEventListener("resize", checkPosition);
  }, []);

  return (
    <div
      className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 py-4 bg-white rounded-b-xl border-t border-gray-100"
      ref={listboxRef}
    >
      {/* Rows per page using Listbox */}
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">Rows per page:</span>
        <Listbox value={rowsPerPage} onChange={onRowsPerPageChange}>
          <div className="relative w-24">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-1 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 sm:text-sm">
              <span className="block truncate">{rowsPerPage}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>

            <Listbox.Options
              className={`absolute ${
                dropUp ? "bottom-full mb-1" : "top-full mt-1"
              } max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50`}
            >
              {rowsPerPageOptions.map((option) => (
                <Listbox.Option
                  key={option}
                  value={option}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" />
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

      {/* Page navigation */}
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
