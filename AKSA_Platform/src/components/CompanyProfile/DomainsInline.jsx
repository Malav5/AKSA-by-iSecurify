import React from "react";

const DomainsInline = ({ setShowDomainsInline }) => (
  <div>
    <button
      className="mb-6 px-4 py-2 bg-primary text-white rounded hover:bg-[#800080] text-sm font-semibold"
      onClick={() => setShowDomainsInline(false)}
    >
      &larr; Back to Profile
    </button>
     <div>
                <button className="mb-6 px-4 py-2 bg-primary text-white rounded hover:bg-[#800080] text-sm font-semibold" onClick={() => setShowDomainsInline(false)}>
                  &larr; Back to Profile
                </button>
                <div className="mb-4">
                  <span className="text-gray-500 text-sm">Members / My domains</span>
                  <h2 className="text-xl font-bold mt-2 mb-1 text-primary">Listing all domains <span className="font-normal text-gray-700">1 domains</span></h2>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <input type="text" placeholder="Search" className="w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-gray-50" />
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700"><input type="checkbox" /></th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Domain</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Schedule</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Last scan</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Error code</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Scan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3"><input type="checkbox" /></td>
                        <td className="px-4 py-3 text-gray-900 font-medium">allianzcloud.com</td>
                        <td className="px-4 py-3 flex gap-2 items-center">
                          <button title="Favorite" className="text-gray-400 hover:text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="1.5"/></svg></button>
                          <button title="Delete" className="text-red-400 hover:text-red-600"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5"/></svg></button>
                        </td>
                        <td className="px-4 py-3">12 Feb, 2024 at 10:00</td>
                        <td className="px-4 py-3">12 Jul, 2025 at 10:35</td>
                        <td className="px-4 py-3"><span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">Complete</span></td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3"><label className="inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-400 transition"></div></label></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
    {/* ...domains table JSX... */}
  </div>
);

export default DomainsInline;
