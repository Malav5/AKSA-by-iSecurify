import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { userServices } from "../../services/UserServices";

export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);

const AddMemberModal = ({ onClose, onSuccess }) => {
  const [memberData, setMemberData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const roles = ["admin", "manager", "user"];

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      password: memberData.password || "changeme123",
      role: memberData.role,
    };

    try {
      const result = await userServices.addUser(payload);
      showSuccess(result.message || "User added successfully!");
      setMemberData({ firstName: "", lastName: "", email: "", role: "user", password: "" });
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      showError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 transition-transform duration-500 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-xl font-bold"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          {["firstName", "lastName", "email", "password"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === "email" ? "Email Address" : field === "password" ? "Password" : field}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                value={memberData[field]}
                onChange={(e) => setMemberData({ ...memberData, [field]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080]"
                required
              />
            </div>
          ))}

          {/* Role Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Listbox
              value={memberData.role}
              onChange={(value) => setMemberData({ ...memberData, role: value })}
            >
              <div className="relative">
                <Listbox.Button className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080] flex justify-between items-center">
                  <span>{memberData.role}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  {roles.map((role) => (
                    <Listbox.Option
                      key={role}
                      value={role}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 text-sm ${
                          active ? "bg-purple-100 text-purple-900" : "text-gray-800"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className="flex justify-between items-center">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                          {selected && <Check className="w-4 h-4 text-purple-600" />}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white px-6 py-2 rounded-lg hover:from-[#700070] hover:to-[#d17ad1] font-semibold shadow"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberModal;
