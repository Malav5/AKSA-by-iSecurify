import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const CreateIssue = ({ issueData, setIssueData, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Dropdown options
  const statusOptions = [
    { id: 1, name: "Low" },
    { id: 2, name: "Medium" },
    { id: 3, name: "High" },
  ];

  const criticalityOptions = [
    { id: 1, name: "Low" },
    { id: 2, name: "Medium" },
    { id: 3, name: "High" },
  ];

  const assigneeOptions = [
    { id: 1, name: "Cyclekicks" },
    { id: 2, name: "Alice" },
    { id: 3, name: "Bob" },
    { id: 4, name: "Unassigned" },
  ];

  const solutionOptions = [
    { id: 1, name: "Fix available" },
    { id: 2, name: "Workaround" },
    { id: 3, name: "No solution" },
  ];

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleAddNote = () => {
    if (newNote.trim()) {
      setIssueData({
        ...issueData,
        changeLog: [...(issueData.changeLog || []), newNote],
      });
      setNewNote("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        throw new Error("Failed to create issue");
      }

      const data = await response.json();
      console.log("✅ Issue created:", data);
      onClose();
    } catch (error) {
      console.error("❌ Error submitting issue:", error.message);
      alert("Something went wrong while creating the issue.");
    } finally {
      setLoading(false);
    }
  };

  // Custom Dropdown component
  const CustomDropdown = ({ value, onChange, options, placeholder }) => (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-default rounded bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-[#800080] focus-visible:ring-2 focus-visible:ring-[#ee8cee]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-sm">
          <span className={`block truncate ${!value ? "text-gray-400" : ""}`}>
            {value || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
          {options.map((option) => (
            <Listbox.Option
              key={option.id}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? "bg-[#f9ecf9] text-[#800080]" : "text-gray-900"
                }`
              }
              value={option.name}
            >
              {({ selected }) => (
                <>
                  <span
                    className={`block truncate ${
                      selected ? "font-medium" : "font-normal"
                    }`}
                  >
                    {option.name}
                  </span>
                  {selected ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#800080]">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className={`bg-white/90 rounded-2xl shadow-2xl p-8 max-w-4xl w-full scrollbar-hide transform transition-transform duration-600 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create new issue</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Issue name */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Issue name
            </label>
            <input
              type="text"
              value={issueData.title}
              onChange={(e) =>
                setIssueData({ ...issueData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2"
              placeholder="Name this issue..."
              required
            />
          </div>

          {/* Status and Criticality row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Status
              </label>
              <CustomDropdown
                value={issueData.status}
                onChange={(value) =>
                  setIssueData({ ...issueData, status: value })
                }
                options={statusOptions}
                placeholder="Select status"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Criticality
              </label>
              <CustomDropdown
                value={issueData.level}
                onChange={(value) =>
                  setIssueData({ ...issueData, level: value })
                }
                options={criticalityOptions}
                placeholder="Assign criticality"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={issueData.description}
              onChange={(e) =>
                setIssueData({ ...issueData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 min-h-[100px]"
              placeholder="Add Description..."
            />
          </div>

          {/* Assignee and Solution row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Assignee
              </label>
              <CustomDropdown
                value={issueData.assignedTo}
                onChange={(value) =>
                  setIssueData({ ...issueData, assignedTo: value })
                }
                options={assigneeOptions}
                placeholder="Select assignee"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Solution
              </label>
              <CustomDropdown
                value={issueData.solution}
                onChange={(value) =>
                  setIssueData({ ...issueData, solution: value })
                }
                options={solutionOptions}
                placeholder="Pick solution"
              />
            </div>
          </div>

          {/* Change log */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Change log
            </label>
            <div className="border border-gray-200 rounded p-4 bg-white/80">
              {(!issueData.changeLog || issueData.changeLog.length === 0) && (
                <p className="text-gray-500 italic">
                  You don't have any notes yet...
                </p>
              )}
              {issueData.changeLog?.map((note, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  {note}
                </div>
              ))}
              <div className="mt-4 flex">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l px-4 py-2"
                  placeholder="Post a new note..."
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white px-4 py-2 rounded-r hover:from-[#700070] hover:to-[#d17ad1] transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white px-6 py-2 rounded-lg hover:from-[#700070] hover:to-[#d17ad1] font-semibold shadow"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create issue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssue;
