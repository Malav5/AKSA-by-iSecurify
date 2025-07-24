import React, { useEffect, useState } from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import axios from "axios";
import { Loader2, Users as UsersIcon } from "lucide-react"; // Optional icons

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.users || []);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
              <UsersIcon className="w-6 h-6 text-blue-600" /> All Users
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
                        {["Name", "Email", "Company", "Role", "Plan"].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-3 whitespace-nowrap font-medium">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            {user.companyName || "-"}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap capitalize">
                            {user.role || "user"}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            {user.plan || "-"}
                          </td>
                        </tr>
                      ))}
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
