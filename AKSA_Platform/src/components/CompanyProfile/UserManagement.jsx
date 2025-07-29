import React, { useEffect, useState, useRef } from "react";
import AddMemberModal from "../Dashboard/AddMemberModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showSuccess, showError } from "../ui/toast"; // adjust path as needed
import { userServices } from "../../services/UserServices";
import { Users, UserPlus, Crown, Globe, Lock, Shield, ArrowUp, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const UserManagement = ({
  showAddMemberModal,
  setShowAddMemberModal,
}) => {
  const [members, setMembers] = useState([]);
  const [adminAssignments, setAdminAssignments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const selectAllRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Plan icons mapping
  const planIcons = {
    "Freemium": <Shield className="w-4 h-4 text-gray-500" />,
    "Aditya": <Globe className="w-4 h-4 text-blue-500" />,
    "Ayush": <Lock className="w-4 h-4 text-purple-500" />,
    "Moksha": <Crown className="w-4 h-4 text-yellow-500" />
  };

  const planColors = {
    "Freemium": "bg-gray-100 text-gray-700",
    "Aditya": "bg-blue-100 text-blue-700",
    "Ayush": "bg-purple-100 text-purple-700",
    "Moksha": "bg-yellow-100 text-yellow-700"
  };

  // Fetch all users and admin-user assignments
  const fetchAdminAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      // Only fetch all users if user is admin, otherwise fetch only assigned users
      if (userRole === 'admin') {
        // Fetch all users
        const usersResponse = await fetch("http://localhost:3000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch all admin-user assignments
        const assignmentsResponse = await fetch("http://localhost:3000/api/agentMap/admin-user-assignments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (usersResponse.ok && assignmentsResponse.ok) {
          const usersData = await usersResponse.json();
          const assignmentsData = await assignmentsResponse.json();

          console.log('Users data received:', usersData.users);
          console.log('Sample user company name:', usersData.users?.[0]?.companyName);

          setAdminAssignments(assignmentsData.assignments || []);
          // Filter out admin users for admin view
          const filteredUsers = (usersData.users || []).filter(user => user.role !== 'admin');
          setMembers(filteredUsers);
        }
      } else {
        // For subadmins, fetch only their assigned users (original behavior)
        const currentUserEmail = localStorage.getItem("currentUser");
        const response = await fetch("http://localhost:3000/api/agentMap/admin-user-assignments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Assignments data received:', data.assignments);
          console.log('Sample user from assignment:', data.assignments?.[0]?.users?.[0]);

          setAdminAssignments(data.assignments || []);
          // Find the assignment for the current subadmin
          const myAssignment = (data.assignments || []).find(a => a.admin.email === currentUserEmail);
          if (myAssignment) {
            console.log('My assignment users:', myAssignment.users);
            setMembers(myAssignment.users || []);
          } else {
            setMembers([]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch users and assignments:", error);
    }
  };

  useEffect(() => {
    fetchAdminAssignments();
  }, [location.pathname]);

  // Refresh data when component comes into focus (e.g., after returning from payment portal)
  useEffect(() => {
    const handleFocus = () => {
      fetchAdminAssignments();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Refresh data when location changes (e.g., returning from another page)
  useEffect(() => {
    fetchAdminAssignments();
  }, [location.pathname]);

  useEffect(() => {
    // Update indeterminate state
    if (!selectAllRef.current) return;
    if (selectedRows.length === 0) {
      selectAllRef.current.indeterminate = false;
      selectAllRef.current.checked = false;
    } else if (selectedRows.length === members.length) {
      selectAllRef.current.indeterminate = false;
      selectAllRef.current.checked = true;
    } else {
      selectAllRef.current.indeterminate = true;
      selectAllRef.current.checked = false;
    }
  }, [selectedRows, members]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(members.map((_, idx) => idx));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (idx) => {
    setSelectedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // When AddMemberModal closes, refresh the list
  const handleModalClose = () => {
    setShowAddMemberModal(false);
    fetchAdminAssignments();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await userServices.deleteUser(id);
      showSuccess("User deleted successfully");
      fetchAdminAssignments(); // Refresh the user list
    } catch (error) {
      showError("Failed to delete user");
    }
  };

  const handleUpgradePlan = (user) => {
    // Navigate to the UpgradePlan page with user information
    navigate("/upgrade-plan", {
      state: {
        upgradeForUser: true,
        userEmail: user.email,
        userName: user.name,
        currentPlan: user.plan
      }
    });
  };

  // Helper function to find which admin added a specific user
  const getAdminForUser = (userId) => {
    for (const assignment of adminAssignments) {
      const userInAssignment = assignment.users.find(user => user._id === userId);
      if (userInAssignment) {
        return assignment.admin;
      }
    }
    return null;
  };

  const handleRefresh = () => {
    fetchAdminAssignments();
    showSuccess("User list refreshed");
  };

  // Get user role for dynamic title
  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === 'admin';

  return (
    <div className="w-full px-2 animate-fade-in-up">
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Title, description, and add button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="flex items-start gap-3">
          <Users className="w-7 h-7 text-primary mt-1 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-primary mb-1">
              {isAdmin ? 'User Management' : 'User Management'}
            </h1>
            <p className="text-gray-500">
              {isAdmin
                ? 'Manage users in the system (excluding admin users), view who added each user, and control permissions.'
                : 'Manage your organization\'s members, roles, and permissions.'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="bg-primary text-white font-semibold px-6 py-3 rounded-lg text-lg flex items-center gap-2 shadow hover:bg-[#700070] transition-all duration-200"
            onClick={() => setShowAddMemberModal(true)}
          >
            <UserPlus className="w-5 h-5" />
            Add new member
          </button>
        </div>
      </div>

      {/* Statistics for admin users */}
      {isAdmin && members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{members.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {members.filter(m => m.isEmailVerified).length}
            </div>
            <div className="text-sm text-gray-600">Verified Users</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {members.filter(m => m.role === 'subadmin').length}
            </div>
            <div className="text-sm text-gray-600">Subadmins</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {members.filter(m => !getAdminForUser(m._id)).length}
            </div>
            <div className="text-sm text-gray-600">Self-registered</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-lg shadow-xl animate-fade-in-up">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  onChange={handleSelectAll}
                  aria-label="Select all members"
                />
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Member name</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Plan</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Added By</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Company</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member, idx) => {
              let name = member.name || `${member.firstName || ""} ${member.lastName || ""}`;
              let role = member.role || "user";
              let email = member.email;
              let createdAt = member.createdAt;
              let plan = member.plan || "Freemium";
              let isEmailVerified = member.isEmailVerified;
              const adminInfo = getAdminForUser(member._id);
              const currentUserEmail = localStorage.getItem("currentUser");
              const isAddedByCurrentUser = adminInfo && adminInfo.email === currentUserEmail;

              return (
                <tr key={idx} className="hover:bg-purple-50 transition-colors duration-200">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(idx)}
                      onChange={() => handleSelectRow(idx)}
                      aria-label={`Select user ${name}`}
                    />
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg bg-cyan-400 shadow-md">
                      {name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : ""}
                    </span>
                    <span className="font-medium text-gray-900">{name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${role?.toLowerCase() === 'admin' ? 'bg-secondary text-primary' : 'bg-gray-200 text-gray-700'}`}>{role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {planIcons[plan]}
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${planColors[plan]}`}>
                        {plan}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isEmailVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {isEmailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {adminInfo ? (
                      <div className="text-sm">
                        <div className="font-medium flex items-center gap-1">
                          {adminInfo.name}
                          {isAdmin && isAddedByCurrentUser && (
                            <span className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-gray-500">{adminInfo.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Self-registered</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        title="Upgrade Plan"
                        onClick={() => handleUpgradePlan(member)}
                      >
                        Upgrade Plan
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                        onClick={() => handleDelete(member._id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2-2z" /></svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {member.companyName ? member.companyName : (member.companyName === "" ? "No Company" : "-")}
                  </td>
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
