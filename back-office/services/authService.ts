import api from "./api";

const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });

      // Store token in localStorage
      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.data.token);

        // Check if user is admin
        if (response.data.data.user.role !== "admin") {
          throw new Error("Unauthorized - Admin access required");
        }
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint (optional)
      await api.post("/api/auth/logout");

      // Remove token
      localStorage.removeItem("token");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Still remove token even if API call fails
      localStorage.removeItem("token");
      return { success: true };
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get("/api/auth/verify-token");

      // Verify user is admin
      if (response.data.data.user.role !== "admin") {
        throw new Error("Unauthorized - Admin access required");
      }

      return { isAuthenticated: true, user: response.data.data.user };
    } catch (error) {
      localStorage.removeItem("token");
      return { isAuthenticated: false, user: null };
    }
  },
};

export default authService;
