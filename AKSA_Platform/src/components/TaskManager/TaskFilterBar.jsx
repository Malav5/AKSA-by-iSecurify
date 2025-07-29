import { Plus } from "lucide-react";

export default function TaskFiltersBar({ onFilterChange, onCreateTask }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        {/* Placeholder for future filters */}
      </div>
      <button
        onClick={onCreateTask}
        className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white font-semibold px-5 py-2 rounded-lg shadow hover:from-[#700070] hover:to-[#d17ad1] flex items-center gap-2 transition"
      >
        <Plus className="w-4 h-4" />
        Create New Task
      </button>
    </div>
  );
}
