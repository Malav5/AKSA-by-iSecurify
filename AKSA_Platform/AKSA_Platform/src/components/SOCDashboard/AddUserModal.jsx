// src/components/AddUserModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react'; // icon for close button
import axios from 'axios';

const AddUserModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (formData.firstName && formData.lastName && formData.email) {
      try {
        await axios.post('/api/agentMap/add-user', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });
        alert('User added successfully!');
        onSubmit && onSubmit(formData);
        onClose();
      } catch (err) {
        alert('Failed to add user.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center transition-opacity">
      <div className="relative w-[90%] sm:w-[450px] bg-white rounded-xl shadow-2xl p-6 sm:p-8 animate-fade-in">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Add New User
        </h2>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select department</option>
              <option value="IT">IT</option>
              <option value="Security">Security</option>
              <option value="Development">Development</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
            </select>
          </div> */}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
