import { useState } from "react";

export default function FiltersBar({ onFilterChange, onCreateIssue }) {
 

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      {/* Left content — you can add filters here later */}
      <div className="flex-1 w-full md:w-auto">
        {/* Placeholder for filters if needed in future */}
      </div>

      {/* Right-aligned button */}
      <div className="flex justify-end w-full md:w-auto">
        <button
          onClick={onCreateIssue}
          className="bg-primary  text-white font-semibold px-4 py-2 rounded shadow"
        >
          + Create New Issue
        </button>
      </div>
    </div>
  );
}
