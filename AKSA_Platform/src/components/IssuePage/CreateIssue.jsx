import React, { useEffect, useState } from "react";

const CreateIssue = ({ issueData, setIssueData, onClose, onSubmit }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          onSubmit(e);
        }}
        className={`bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full
        transform transition-transform duration-600 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Issue</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Name, Description, Notes */}
          <div>
            <div>
              <label className="block font-medium text-gray-600 mb-1">Issue Name</label>
              <input
                type="text"
                value={issueData.name}
                onChange={(e) =>
                  setIssueData({ ...issueData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Enter issue name"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={issueData.description}
                onChange={(e) =>
                  setIssueData({ ...issueData, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-4 py-2"
                rows={4}
                placeholder="Enter issue description"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600 mb-1">
                Notes (for changelog)
              </label>
              <textarea
                value={issueData.notes || ""}
                onChange={(e) =>
                  setIssueData({ ...issueData, notes: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-4 py-2"
                rows={3}
                placeholder="Optional notes"
              />
            </div>
          </div>

          {/* Right Column: Dropdowns */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-600 mb-1">Status</label>
              <select
                value={issueData.status || ""}
                onChange={(e) =>
                  setIssueData({ ...issueData, status: e.target.value })
                }
                className={`w-full border border-gray-300 rounded px-4 py-2 ${!issueData.status ? "text-gray-400" : "text-black"
                  }`}
                required
              >
                <option value="">Select status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">Criticality</label>
              <select
                value={issueData.criticality || ""}
                onChange={(e) =>
                  setIssueData({ ...issueData, criticality: e.target.value })
                }
                className={`w-full border border-gray-300 rounded px-4 py-2 ${!issueData.criticality ? "text-gray-400" : "text-black"
                  }`}
                required
              >
                <option value="">Select criticality</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">Assignee</label>
              <select
                value={issueData.assignee || ""}
                onChange={(e) =>
                  setIssueData({ ...issueData, assignee: e.target.value })
                }
                className={`w-full border border-gray-300 rounded px-4 py-2 ${!issueData.assignee ? "text-gray-400" : "text-black"
                  }`}
                required
              >
                <option value="">Select assignee</option>
                <option value="Alice">Alice</option>
                <option value="Bob">Bob</option>
                <option value="Charlie">Charlie</option>
                <option value="Dana">Dana</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">Solution</label>
              <select
                value={issueData.solution || ""}
                onChange={(e) =>
                  setIssueData({ ...issueData, solution: e.target.value })
                }
                className={`w-full border border-gray-300 rounded px-4 py-2 ${!issueData.solution ? "text-gray-400" : "text-black"
                  }`}
                required
              >
                <option value="">Select solution</option>
                <option value="Mitigate">Mitigate</option>
                <option value="Accept">Accept</option>
                <option value="Transfer">Transfer</option>
                <option value="Avoid">Avoid</option>
              </select>
            </div>

          </div>
        </div>

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
            Create Issue
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssue;
