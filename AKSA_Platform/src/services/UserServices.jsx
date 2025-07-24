import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // or set this globally if shared
});

export const userServices = {
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
};
