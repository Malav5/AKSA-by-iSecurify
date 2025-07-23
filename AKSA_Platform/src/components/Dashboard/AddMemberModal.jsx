import React, { useState } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showInfo = (message) => toast.info(message);
export const showWarning = (message) => toast.warning(message);

const AddMemberModal = ({ onClose, onSuccess }) => {
  const [memberData, setMemberData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roles = ["admin", "manager", "user"];
  const departments = ["it", "security", "operations", "compliance"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/member/add-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        showError("Failed to add member. Please check the server.");
        throw new Error("Failed to add member. Please check the server.");
      }

      const result = await response.json();
      showSuccess(result.message || "Member added successfully!");
      setMemberData({ name: "", email: "", role: "", department: "" });

      // Show toast
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Member</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-600 bg-green-100 px-3 py-2 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={memberData.name}
              onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={memberData.email}
              onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Role (Listbox) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Listbox
              value={memberData.role}
              onChange={(value) => setMemberData({ ...memberData, role: value })}
            >
              <div className="relative">
                <Listbox.Button className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center">
                  <span>{memberData.role || "Select a role"}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {roles.map((role) => (
                    <Listbox.Option
                      key={role}
                      value={role}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 text-sm ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-700"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className="flex justify-between items-center">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                          {selected && <Check className="w-4 h-4 text-blue-500" />}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Department (Listbox) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Listbox
              value={memberData.department}
              onChange={(value) => setMemberData({ ...memberData, department: value })}
            >
              <div className="relative">
                <Listbox.Button className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center">
                  <span>{memberData.department || "Select a department"}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {departments.map((dept) => (
                    <Listbox.Option
                      key={dept}
                      value={dept}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 text-sm ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-700"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className="flex justify-between items-center">
                          {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          {selected && <Check className="w-4 h-4 text-blue-500" />}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-primary rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
