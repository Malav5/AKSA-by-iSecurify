import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api", // or set this globally if shared
});

export const userServices = {

    // 🔐 Login function
    login: async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            return response.data; // returns { token, user }
        } catch (error) {
            console.error("Login error:", error.message);
            throw error;
        }
    },

    getUser: async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token missing");

            const response = await api.get("/auth/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data; // returns { user: { ... } }
        } catch (error) {
            console.error("Error fetching user:", error.message);
            return null;
        }
    },

    // Get all users with role "user"
    fetchMembers: async () => {
        try {
            const response = await api.get("/agentMap/users-with-role-user");
            return response.data.users || [];
        } catch (error) {
            console.error("Error fetching members:", error.message);
            return [];
        }
    },

    // Add new user (Admin adds user)
    addUser: async (memberData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/agentMap/add-user", memberData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data; // { message: "User added successfully!" }
        } catch (error) {
            console.error("Error adding user:", error.message);
            throw error;
        }
    },

    // Delete a user by ID
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/agentMap/delete-user/${id}`);
            return response.data; // { message: "User deleted successfully" }
        } catch (error) {
            console.error("Error deleting user:", error.message);
            throw error;
        }
    },

    // Upgrade user plan
    upgradeUserPlan: async (userId, newPlan) => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.put(`/agentMap/upgrade-user-plan/${userId}`, 
                { plan: newPlan },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data; // { message: "Plan upgraded successfully" }
        } catch (error) {
            console.error("Error upgrading user plan:", error.message);
            throw error;
        }
    },

    // Get available plans
    getAvailablePlans: async () => {
        try {
            const response = await api.get("/plans");
            return response.data || [];
        } catch (error) {
            console.error("Error fetching plans:", error.message);
            return [];
        }
    },

};
