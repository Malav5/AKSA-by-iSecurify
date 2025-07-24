import React, { useEffect, useState } from "react";

const CreateIssue = ({ issueData, setIssueData, onClose, onSubmit }) => {
  const [visible, setVisible] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleAddNote = () => {
    if (newNote.trim()) {
      setIssueData({
        ...issueData,
        changeLog: [...(issueData.changeLog || []), newNote]
      });
      setNewNote("");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={`bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full
        transform transition-transform duration-600 ease-out
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

        {/* Main form content */}
        <div className="space-y-6">
          {/* Issue name */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">Issue name</label>
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
              <label className="block font-medium text-gray-600 mb-1">Status</label>
              <select
                value={issueData.assignedTo}
                onChange={(e) =>
                  setIssueData({ ...issueData, assignedTo: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-4 py-2"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Cyclekicks">Cyclekicks</option>
                <option value="Alice">Alice</option>
                <option value="Bob">Bob</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-600 mb-1">Criticality</label>
              <select
                value={issueData.level}
                onChange={(e) =>
                  setIssueData({ ...issueData, level: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Assign criticality"
              >
                <option value="">Assign criticality</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">Description</label>
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
              <label className="block font-medium text-gray-600 mb-1">Assignee</label>
              <select
                value={issueData.assignedTo}
                onChange={(e) =>
                  setIssueData({ ...issueData, assignedTo: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-4 py-2"
              >
                <option value="Cyclekicks">Cyclekicks</option>
                <option value="Alice">Alice</option>
                <option value="Bob">Bob</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-600 mb-1">Solution</label>
              <select
                value={issueData.solution}
                onChange={(e) =>
                  setIssueData({ ...issueData, solution: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Pick solution"
              >
                <option value="">Pick solution</option>
                <option value="Fix available">Fix available</option>
                <option value="Workaround">Workaround</option>
                <option value="No solution">No solution</option>
              </select>
            </div>
          </div>

          {/* Change log */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">Change log</label>
            <div className="border border-gray-200 rounded p-4">
              {(!issueData.changeLog || issueData.changeLog.length === 0) && (
                <p className="text-gray-500 italic">You don't have any notes yet...</p>
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
                  className="bg-primary text-white px-4 py-2 rounded-r hover:bg-blue-700"
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
            className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create issue
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssue;