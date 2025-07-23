import React from "react";

const NotificationSettings = () => (
  <div className="max-w-2xl mx-auto">
      <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">Opt-in notifications</h2>
              <p className="text-gray-600 mb-8">Your recurring subscriptions like App notifications.</p>

              {/* Unsubscribe Card */}
              <div className="bg-white border border-gray-300 rounded-xl p-8 mb-10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Want to stop receiving our App notifications</span>
                <button className="text-teal-700 font-semibold hover:underline text-lg md:ml-8">Unsubscribe from this list</button>
          </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button className="flex items-center justify-center border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2z"/></svg>
                  Cancel my account
                </button>
                <button className="border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition">Cancel membership</button>
              </div>
            </div>{/* ...notification settings JSX... */}
  </div>
);

export default NotificationSettings;
