import React, { useEffect, useState } from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import axios from "axios";
import { Loader2, Users as UsersIcon, UserPlus, Crown, Globe, Lock, Shield } from "lucide-react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [adminAssignments, setAdminAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch all users
        const usersResponse = await axios.get(
          "http://localhost:3000/api/auth/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch admin-user assignments to get who added whom
        const assignmentsResponse = await axios.get(
          "http://localhost:3000/api/agentMap/admin-user-assignments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Filter out admin users for admin view
        const filteredUsers = (usersResponse.data.users || []).filter(user => user.role !== 'admin');
        setUsers(filteredUsers);
        setAdminAssignments(assignmentsResponse.data.assignments || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setUsers([]);
        setAdminAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <div className="sticky top-0 h-screen z-30">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-20 bg-white shadow">
          <Header />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div>
            <h1 className="text-3xl font-semibold mb-6 flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-blue-600" /> Users (Excluding Admins)
            </h1>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                  <span className="ml-2">Loading users...</span>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        {["Name", "Email", "Role", "Plan", "Added By", "Company", "Email Verified"].map(
                          (header) => (
                            <th
                              key={header}
                              className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                            >
                              {header}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => {
                        const addedBy = getAdminForUser(user._id);
                        return (
                          <tr
                            key={user._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-3 whitespace-nowrap font-medium">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {user.email}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap capitalize">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'subadmin' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                {user.role || "user"}
                              </span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${planColors[user.plan] || planColors["Freemium"]}`}>
                                {planIcons[user.plan] || planIcons["Freemium"]}
                                {user.plan || "Freemium"}
                              </span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {addedBy ? (
                                <div className="flex items-center gap-2">
                                  <UserPlus className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">
                                    {addedBy.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Self-registered</span>
                              )}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {user.companyName || "-"}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isEmailVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {user.isEmailVerified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No users found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
