import React, { useState, useEffect } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Search,
  MoreHorizontal,
} from "lucide-react";
import TaskDetail from "./TaskDetail";
import { fetchAllTasks, deleteTaskById, updateTaskById } from "../../services/TaskServics";

const getCriticalityStyle = (criticality) => {
  switch (criticality) {
    case "Critical":
      return "bg-red-100 text-red-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "Urgent":
      return "bg-red-100 text-red-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Resolved":
      return "bg-green-100 text-green-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "To Do":
      return "bg-gray-100 text-gray-800";
    case "Unassigned":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TasksTable() {
  const [tasks, setTasks] = useState([]);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [menuTaskId, setMenuTaskId] = useState(null);

  const users = ["Alice Johnson", "Bob Smith", "Charlie Davis", "Dana Lane"];
  const statuses = ["Unassigned", "To Do", "In Progress", "Resolved", "Reopened"];
  const priorities = ["Urgent", "High", "Medium", "Low"];

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchAllTasks();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setMenuTaskId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const deleteTask = async (taskId) => {
    try {
      await deleteTaskById(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Delete error:", err.message);
      alert("Failed to delete task");
    }
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      const updated = await updateTaskById(updatedTask._id, updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task._id === updated._id ? updated : task))
      );
    } catch (err) {
      console.error("Update error:", err.message);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAssigned = !assignedTo || task.assignee === assignedTo;
    const matchesPriority = !priority || task.priority === priority;
    const matchesStatusFilter = !status || task.status === status;

    return matchesSearch && matchesAssigned && matchesPriority && matchesStatusFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const fieldA = a[sortField]?.toString().toLowerCase();
    const fieldB = b[sortField]?.toString().toLowerCase();
    if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-full overflow-hidden">
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="mr-2 font-semibold">Assigned To:</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="bg-secondary text-black rounded px-3 py-2"
          >
            <option value="">All</option>
            {users.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-semibold">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-secondary text-black rounded px-3 py-2"
          >
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-semibold">Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-secondary text-black rounded px-3 py-2"
          >
            <option value="">All</option>
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-2.5 border rounded"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {["name", "criticality", "priority", "status", "assignee"].map((field) => (
                <th
                  key={field}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort(field)}
                >
                  <div className="flex items-center gap-1 capitalize">
                    {field}
                    {sortField === field &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 sr-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => (
              <tr key={task._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td
                  className="px-4 py-2 font-medium text-primary cursor-pointer flex items-center gap-2"
                  onClick={() => setSelectedTask(task)}
                >
                  <BadgeCheck className="w-4 h-4" /> {task.name}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded ${getCriticalityStyle(task.criticality)}`}>
                    {task.criticality}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityStyle(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusStyle(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-2">{task.assignee || "Unassigned"}</td>
                <td className="px-4 py-2">{new Date(task.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(task.updatedAt || task.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 relative">
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuTaskId(menuTaskId === task._id ? null : task._id);
                    }}
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                  {menuTaskId === task._id && (
                    <div className="absolute right-2 mt-2 w-32 bg-white border rounded shadow z-10">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setMenuTaskId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          deleteTask(task._id);
                          setMenuTaskId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {sortedTasks.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}
