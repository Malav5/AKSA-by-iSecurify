import React from "react";
import AddMemberModal from "../Dashboard/AddMemberModal";

const UserManagement = ({
  showAddMemberModal,
  setShowAddMemberModal,

}) => (
  <div className="max-w-6xl mx-auto">
       <div className="max-w-6xl mx-auto">
              <div className="flex justify-end mb-4">
                <button className="bg-primary text-white font-semibold px-6 py-3 rounded-lg text-lg flex items-center gap-2 shadow" onClick={() => setShowAddMemberModal(true)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                  Add new member
            </button>
          </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700"><input type="checkbox" /></th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Member name</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Date added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Placeholder users */}
                    {[
                      {
                        name: "Hemal Mewada",
                        email: "hemal@allianzcloud.com",
                        role: "Admin",
                        status: true,
                        date: "09 Feb, 2024 at 10:40 (GMT +0530)",
                        initials: "HM",
                        color: "bg-cyan-400"
                      },
                      {
                        name: "Rahul Joshi",
                        email: "rahul@allianzcloud.com",
                        role: "Member",
                        status: true,
                        date: "23 Feb, 2024 at 14:38 (GMT +0530)",
                        initials: "RJ",
                        color: "bg-cyan-400"
                      },
                      {
                        name: "Shaikh Moin",
                        email: "moin@allianzcloud.com",
                        role: "Member",
                        status: true,
                        date: "23 May, 2024 at 17:53 (GMT +0530)",
                        initials: "SM",
                        color: "bg-cyan-400"
                      }
                    ].map((user, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><input type="checkbox" /></td>
                        <td className="px-4 py-3 flex items-center gap-3">
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg ${user.color}`}>{user.initials}</span>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${user.role === 'Admin' ? 'bg-secondary text-primary' : 'bg-gray-200 text-gray-700'}`}>{user.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={user.status} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-400 transition"></div>
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-red-500 hover:text-red-700" title="Delete">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2z"/></svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{user.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showAddMemberModal && (
                <AddMemberModal onClose={() => setShowAddMemberModal(false)} />
              )}
            </div>
    {/* ...user management JSX... */}
    {showAddMemberModal && (
      <AddMemberModal onClose={() => setShowAddMemberModal(false)} />
    )}
  </div>
);

export default UserManagement;
