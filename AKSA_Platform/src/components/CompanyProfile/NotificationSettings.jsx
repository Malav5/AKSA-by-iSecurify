import React, { useState } from "react";
import { Bell } from "lucide-react";

const NotificationSettings = () => {
  const [showIssues, setShowIssues] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showNotes, setShowNotes] = useState(true);

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
          <Bell className="w-6 h-6 text-primary" strokeWidth={2} style={{ display: 'block', margin: 0 }} />
        </span>
        <h2 className="text-2xl font-bold text-gray-900">In-app notification settings</h2>
      </div>

      {/* Email & Dashboard Settings */}
      <div className="mb-6 space-y-3 bg-white/80 backdrop-blur-lg rounded-2xl shadow p-6">
        <label className="flex items-center gap-3 text-lg text-gray-900 font-medium">
          <input type="checkbox" className="accent-primary w-5 h-5" />
          Send all notifications in an email notification
        </label>
        <label className="flex items-center gap-3 text-lg text-gray-900 font-medium">
          <input type="checkbox" className="accent-primary w-5 h-5" defaultChecked />
          Send in dashboard notifications
        </label>
      </div>

      {/* Notification Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Notifications for Issues */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow p-6">
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

        {/* Notifications for Tasks */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow p-6">
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

        {/* Notifications for Notes */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow p-6 lg:col-span-2">
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
      </div>

      {/* Save / Cancel Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button className="border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition">
          Cancel
        </button>
        <button className="flex items-center gap-2 bg-primary hover:bg-teal-600 text-white rounded-lg px-6 py-3 text-lg font-semibold transition shadow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Save changes
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
