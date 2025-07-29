import React, { useState, useEffect } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { Menu, Transition, Listbox } from '@headlessui/react';
import TaskDetail from "./TaskDetail";
import {
  fetchAllTasks,
  deleteTaskById,
  updateTaskById,
} from "../../services/TaskServics";
import Pagination from "../Pagination";
import { showSuccess, showError } from "../ui/toast";

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
    case "Reopened":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TasksTable() {
  const [tasks, setTasks] = useState([
    {
      _id: "1",
      name: "Check",
      criticality: "Low",
      priority: "Low",
      status: "In Progress",
      assignee: "Alice Johnson",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "2",
      name: "check",
      criticality: "Medium",
      priority: "Medium",
      status: "Resolved",
      assignee: "Bob Smith",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "3",
      name: "Check alerts",
      criticality: "Low",
      priority: "Low",
      status: "In Progress",
      assignee: "Charlie Davis",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "4",
      name: "Check all rules",
      criticality: "Medium",
      priority: "Medium",
      status: "Resolved",
      assignee: "Dana Lane",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "5",
      name: "vbn",
      criticality: "High",
      priority: "High",
      status: "Reopened",
      assignee: "Krina Patel (manager)",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const users = [
    { id: 0, name: "All", value: "" },
    { id: 1, name: "Alice Johnson", value: "Alice Johnson" },
    { id: 2, name: "Bob Smith", value: "Bob Smith" },
    { id: 3, name: "Charlie Davis", value: "Charlie Davis" },
    { id: 4, name: "Dana Lane", value: "Dana Lane" },
    { id: 5, name: "Krina Patel (manager)", value: "Krina Patel (manager)" },
  ];

  const statuses = [
    { id: 0, name: "All", value: "" },
    { id: 1, name: "Unassigned", value: "Unassigned" },
    { id: 2, name: "To Do", value: "To Do" },
    { id: 3, name: "In Progress", value: "In Progress" },
    { id: 4, name: "Resolved", value: "Resolved" },
    { id: 5, name: "Reopened", value: "Reopened" },
  ];

  const priorities = [
    { id: 0, name: "All", value: "" },
    { id: 1, name: "Urgent", value: "Urgent" },
    { id: 2, name: "High", value: "High" },
    { id: 3, name: "Medium", value: "Medium" },
    { id: 4, name: "Low", value: "Low" },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAssigned = !assignedTo || task.assignee === assignedTo;
    const matchesPriority = !priority || task.priority === priority;
    const matchesStatusFilter = !status || task.status === status;

    return (
      matchesSearch && matchesAssigned && matchesPriority && matchesStatusFilter
    );
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const fieldA = a[sortField]?.toString().toLowerCase();
    const fieldB = b[sortField]?.toString().toLowerCase();
    if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTasks = sortedTasks.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);

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

  const deleteTask = async (taskId) => {
    try {
      await deleteTaskById(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      showSuccess("Task deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err.message);
      showError("Failed to delete task");
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

  const FilterDropdown = ({ value, onChange, options, label }) => (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Label className="mr-2 font-semibold">{label}:</Listbox.Label>
          <Listbox.Button className="relative w-40 bg-gray-50 border border-gray-300 text-gray-800 rounded px-3 py-2 text-left focus:ring-2 focus:ring-[#800080] focus:border-[#800080]">
            <span className="block truncate">
              {options.find(opt => opt.value === value)?.name || "All"}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'transform rotate-180' : ''}`}
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 scrollbar-hide overflow-auto focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `${
                      active ? 'bg-secondary text-primary' : 'text-gray-900'
                    } cursor-default select-none relative py-2 pl-3 pr-9`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`${
                          selected ? 'font-semibold' : 'font-normal'
                        } block truncate`}
                      >
                        {option.name}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-full overflow-hidden border border-gray-100">
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <FilterDropdown
          value={assignedTo}
          onChange={setAssignedTo}
          options={users}
          label="Assigned To"
        />
        <FilterDropdown
          value={status}
          onChange={setStatus}
          options={statuses}
          label="Status"
        />
        <FilterDropdown
          value={priority}
          onChange={setPriority}
          options={priorities}
          label="Priority"
        />
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-2.5 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-[#800080] focus:border-[#800080]"
          />
        </div>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 top-0 z-10">
              <tr>
                {[
                  "name",
                  "criticality",
                  "priority",
                  "status",
                  "assignee",
                ].map((field) => (
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
              {currentTasks.map((task) => (
                <tr
                  key={task._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <td
                    className="px-4 py-2 font-medium text-primary cursor-pointer flex items-center gap-2"
                    onClick={() => setSelectedTask(task)}
                  >
                    <BadgeCheck className="w-4 h-4" /> {task.name}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold ${getCriticalityStyle(
                        task.criticality
                      )}`}
                    >
                      {task.criticality || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      {task.priority || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      {task.status || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{task.assignee || "Unassigned"}</td>
                  <td className="px-4 py-2">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(
                      task.updatedAt || task.createdAt
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 relative">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button className="p-1 rounded-full hover:bg-gray-200">
                          <MoreHorizontal className="w-5 h-5 text-gray-500" />
                        </Menu.Button>
                      </div>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => setSelectedTask(task)}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                                >
                                  View Details
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => deleteTask(task._id)}
                                  className={`${
                                    active ? 'bg-red-50' : ''
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600`}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))}
              {currentTasks.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        totalItems={filteredTasks.length}
      />
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