import React, { useEffect, useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { createTask } from "../../services/TaskServics";
import { userServices } from "../../services/UserServices";
import { showSuccess, showError } from "../ui/toast";

const CreateTask = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState([]);

  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    notes: "",
    status: "",
    priority: "",
    assignee: "",
    category: "",
    criticality: "",
  });

  const statusOptions = ["To Do", "In Progress", "Completed", "Blocked"];
  const priorityOptions = ["Low", "Medium", "High", "Urgent"];
  const categoryOptions = ["Development", "Design", "Testing", "Documentation"];
  const criticalityOptions = [
    "Informational",
    "Low",
    "Medium",
    "High",
    "Critical",
  ];

  useEffect(() => {
    setVisible(true);
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await userServices.fetchMembers();
      const users = Array.isArray(response)
        ? response
        : Array.isArray(response.users)
        ? response.users
        : [];
      const formatted = users.map((user) => user.name);
      setAssigneeOptions(formatted);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      await createTask(taskData);
      showSuccess("Task created successfully!");
      onClose();
    } catch (error) {
      showError("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const CustomDropdown = ({ label, value, options, onChange }) => (
    <div>
      <label className="block text-gray-600 font-medium mb-1">{label}</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-[#800080] focus-visible:ring-2 focus-visible:ring-[#ee8cee]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-sm">
            <span className={`block truncate ${!value ? "text-gray-400" : ""}`}>
              {value || `Select ${label.toLowerCase()}`}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
              {options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-[#f9ecf9] text-[#800080]" : "text-gray-900"
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {option}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#800080]">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
        className={`bg-white/90 rounded-2xl shadow-2xl p-8 max-w-4xl w-full transform transition-transform duration-600 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-600 mb-1">Task Name</label>
            <input
              type="text"
              value={taskData.name}
              onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-4 py-2"
              placeholder="Enter task name"
              required
            />

            <div className="mt-4">
              <label className="block font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-4 py-2"
                rows={4}
                placeholder="Enter task description"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600 mb-1">Notes (optional)</label>
              <textarea
                value={taskData.notes}
                onChange={(e) => setTaskData({ ...taskData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded px-4 py-2"
                rows={3}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="space-y-4">
            <CustomDropdown
              label="Status"
              value={taskData.status}
              options={statusOptions}
              onChange={(val) => setTaskData({ ...taskData, status: val })}
            />
            <CustomDropdown
              label="Priority"
              value={taskData.priority}
              options={priorityOptions}
              onChange={(val) => setTaskData({ ...taskData, priority: val })}
            />
            <CustomDropdown
              label="Assignee"
              value={taskData.assignee}
              options={assigneeOptions}
              onChange={(val) => setTaskData({ ...taskData, assignee: val })}
            />
            <CustomDropdown
              label="Category"
              value={taskData.category}
              options={categoryOptions}
              onChange={(val) => setTaskData({ ...taskData, category: val })}
            />
            <CustomDropdown
              label="Criticality"
              value={taskData.criticality}
              options={criticalityOptions}
              onChange={(val) => setTaskData({ ...taskData, criticality: val })}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white px-6 py-2 rounded-lg hover:from-[#700070] hover:to-[#d17ad1] font-semibold shadow"
            disabled={loading}
          >
            {loading ? "Saving..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
