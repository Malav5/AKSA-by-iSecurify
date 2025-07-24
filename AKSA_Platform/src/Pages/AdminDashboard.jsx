import React, { useEffect, useState } from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUser(data.user || null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white text-gray-800">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-white">
          <Header />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          <h1 className="text-2xl font-bold mb-6">User Info</h1>
          {loading ? (
            <div>Loading user...</div>
          ) : user ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">Role</th>
                    <th className="px-4 py-2 border-b">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-2 border-b">{user.email}</td>
                    <td className="px-4 py-2 border-b">{user.role || "user"}</td>
                    <td className="px-4 py-2 border-b">{user.plan || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div>No user found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
