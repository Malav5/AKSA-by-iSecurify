import React, { useEffect, useState } from "react";
import AddMemberModal from "../Dashboard/AddMemberModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showSuccess, showError } from "../ui/toast"; // adjust path as needed

const UserManagement = ({
  showAddMemberModal,
  setShowAddMemberModal,
}) => {
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch members from backend
  const fetchMembers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/member/get-members");
      const data = await res.json();
      // You may need to adjust this depending on your backend response
      setMembers(data.members || []);
    } catch (err) {
      setMembers([]);
    }
  };

  useEffect(() => {
    fetchMembers();
    // Example: fetch user from localStorage or API
    const user = JSON.parse(localStorage.getItem("user")); // or fetch from API
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    console.log("Fetched members:", members);
  }, [members]);

  // When AddMemberModal closes, refresh the list
  const handleModalClose = () => {
    setShowAddMemberModal(false);
    fetchMembers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    const res = await fetch(`http://localhost:3000/api/member/delete-member/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showSuccess("Member deleted successfully");
      fetchMembers();
    } else {
      showError("Failed to delete member");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex justify-end mb-4">
        <button
          className="bg-primary text-white font-semibold px-6 py-3 rounded-lg text-lg flex items-center gap-2 shadow"
          onClick={() => setShowAddMemberModal(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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
            {members.map((member, idx) => {
              // If member is a string, parse it
              let name = "", role = "", email = "", createdAt = "";
              if (typeof member === "string") {
                [name, role] = member.split(" - ");
              } else {
                name = member.name;
                role = member.role;
                email = member.email;
                createdAt = member.createdAt;
              }
              return (
                <tr key={idx}>
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg bg-cyan-400">
                      {name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : ""}
                    </span>
                    <span className="font-medium text-gray-900">{name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${role?.toLowerCase() === 'admin' ? 'bg-secondary text-primary' : 'bg-gray-200 text-gray-700'}`}>{role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-400 transition"></div>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    {/* {currentUser?.role === "admin" && ( */}
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                      onClick={() => handleDelete(member._id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2-2z" /></svg>
                    </button>
                    {/* ) */}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{new Date(createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showAddMemberModal && (
        <AddMemberModal onClose={handleModalClose} />
      )}
    </div>
  );
};

export default UserManagement;
