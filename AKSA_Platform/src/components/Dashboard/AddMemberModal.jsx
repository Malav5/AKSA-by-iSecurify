import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, Eye, EyeOff } from "lucide-react";
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
    companyName: "",
  });

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Get current user's role and set available roles based on permissions
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setCurrentUserRole(userRole);

    // Set default role based on current user's permissions
    if (userRole === 'subadmin') {
      setMemberData(prev => ({ ...prev, role: "user" }));
    }
  }, []);

  // Define available roles based on current user's role
  const getAvailableRoles = () => {
    if (currentUserRole === 'admin') {
      return ["user", "subadmin", "admin"];
    } else if (currentUserRole === 'subadmin') {
      return ["user"];
    }
    return ["user"]; // Default fallback
  };

  const roles = getAvailableRoles();

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
      ...(currentUserRole === 'admin' && { companyName: memberData.companyName }),
    };

    try {
      const result = await userServices.addUser(payload);
      showSuccess(result.message || "User added successfully!");
      setMemberData({ firstName: "", lastName: "", email: "", role: "user", password: "", companyName: "" });
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
        className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 transition-transform duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
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
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={memberData.firstName}
              onChange={(e) => setMemberData({ ...memberData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080]"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={memberData.lastName}
              onChange={(e) => setMemberData({ ...memberData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080]"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080]"
              required
            />
          </div>

          {/* Company Name - Only for Admin */}
          {currentUserRole === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={memberData.companyName}
                onChange={(e) => setMemberData({ ...memberData, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080]"
                required
              />
            </div>
          )}

          {/* Password with show/hide toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={memberData.password}
                onChange={(e) => setMemberData({ ...memberData, password: e.target.value })}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            {currentUserRole === 'subadmin' ? (
              // For subadmin, show disabled input with only "user" role
              <input
                type="text"
                value="User"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            ) : (
              // For admin, show dropdown with all available roles
              <Listbox
                value={memberData.role}
                onChange={(value) => setMemberData({ ...memberData, role: value })}
              >
                <div className="relative">
                  <Listbox.Button className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080] flex justify-between items-center">
                    <span>{memberData.role.charAt(0).toUpperCase() + memberData.role.slice(1)}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {roles.map((role) => (
                      <Listbox.Option
                        key={role}
                        value={role}
                        className={({ active }) =>
                          `cursor-pointer px-4 py-2 text-sm ${active ? "bg-purple-100 text-purple-900" : "text-gray-800"
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
            )}
            {currentUserRole === 'subadmin' && (
              <p className="text-xs text-gray-500 mt-1">
                Subadmins can only create users with "User" role
              </p>
            )}
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
