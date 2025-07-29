import { Plus } from "lucide-react";

export default function FiltersBar({ onFilterChange, onCreateIssue }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-4 py-3">
      {/* Left content — you can add filters here later */}
      <div className="flex-1 w-full md:w-auto">
        {/* Placeholder for filters if needed in future */}
      </div>

      {/* Right-aligned button */}
      <div className="flex justify-end w-full md:w-auto">
        <button
          onClick={onCreateIssue}
          className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white font-semibold px-5 py-2 rounded-lg shadow hover:from-[#700070] hover:to-[#d17ad1] flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Issue
        </button>
      </div>
    </div>
  );
}
