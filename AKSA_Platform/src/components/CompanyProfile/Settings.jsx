import React, { useState } from "react";

const Settings = () => {
  const [showIssues, setShowIssues] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showNotes, setShowNotes] = useState(true);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-block w-7 h-7 bg-secondary rounded-full flex items-center justify-center">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" stroke="#800080" strokeWidth="2" />
            <path d="M10 7v3.5" stroke="#800080" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="14" r="1" fill="#800080" />
          </svg>
        </span>
        <h2 className="text-2xl font-semibold text-gray-900">In-app notification settings</h2>
      </div>

      {/* Email & Dashboard Settings */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center gap-3 text-lg text-gray-900 font-medium">
          <input type="checkbox" className="accent-primary w-5 h-5" />
          Send all notifications in an email notification
        </label>
        <label className="flex items-center gap-3 text-lg text-gray-900 font-medium">
          <input type="checkbox" className="accent-primary w-5 h-5" defaultChecked />
          Send in dashboard notifications
        </label>
      </div>

      {/* Notifications for Issues */}
      <div className="mt-8">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowIssues(!showIssues)}
        >
          <span className="text-lg font-semibold text-gray-900">Notifications for Issues</span>
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 20 20"
            className={`transform transition-transform duration-300 ${showIssues ? "rotate-180" : ""}`}
          >
            <path d="M6 8l4 4 4-4" stroke="#800080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {showIssues && (
          <div className="ml-2 mt-3 space-y-2">
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Issue resolution
            </label>
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Issue assignment
            </label>
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Bulk edit
            </label>
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Bulk assignment
            </label>
          </div>
        )}
      </div>

      <hr className="my-8 border-gray-300" />

      {/* Notifications for Tasks */}
      <div className="mt-8">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowTasks(!showTasks)}
        >
          <span className="text-lg font-semibold text-gray-900">Notifications for Tasks</span>
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 20 20"
            className={`transform transition-transform duration-300 ${showTasks ? "rotate-180" : ""}`}
          >
            <path d="M6 8l4 4 4-4" stroke="#800080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {showTasks && (
          <div className="ml-2 mt-3 space-y-2">
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Task resolution
            </label>
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Task assignment
            </label>
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Bulk edit
            </label>
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Bulk assignment
            </label>
          </div>
        )}
      </div>

      <hr className="my-8 border-gray-300" />

      {/* Notifications for Notes */}
      <div className="mt-8">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowNotes(!showNotes)}
        >
          <span className="text-lg font-semibold text-gray-900">Notifications for Notes</span>
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 20 20"
            className={`transform transition-transform duration-300 ${showNotes ? "rotate-180" : ""}`}
          >
            <path d="M6 8l4 4 4-4" stroke="#800080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {showNotes && (
          <div className="ml-2 mt-3 space-y-2">
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Resolution notes
            </label>
            <label className="flex items-center gap-3 text-gray-900">
              <input type="checkbox" className="accent-primary w-5 h-5" /> Bulk notes
            </label>
          </div>
        )}
      </div>

      {/* Save / Cancel Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button className="border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition">
          Cancel
        </button>
        <button className="flex items-center gap-2 bg-primary hover:bg-teal-600 text-white rounded-lg px-6 py-3 text-lg font-semibold transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Save changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
