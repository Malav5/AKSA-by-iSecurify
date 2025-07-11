// src/components/AddUserModal.jsx
import React, { useState } from 'react';

const AddUserModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    department: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (formData.username && formData.email && formData.department) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] sm:w-[400px] rounded-lg shadow-xl p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

        <div className="space-y-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
          />

          {/* Department Dropdown */}
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-white"
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="Security">Security</option>
            <option value="Development">Development</option>
            <option value="Operations">Operations</option>
            <option value="HR">HR</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
