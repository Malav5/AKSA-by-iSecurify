  import { useState } from "react";

  export default function TaskFiltersBar({ onFilterChange, onCreateTask }) {
 
    return (
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          
        </div>

        <button
          onClick={onCreateTask}
          className="bg-primary text-white font-semibold px-4 py-2 rounded shadow"
        >
          + Create New Task
        </button>
      </div>
    );
  }
