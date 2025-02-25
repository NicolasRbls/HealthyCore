import apiService from "./api.service";

const authService = {
  async register(userData: any) {
    return apiService.post("/auth/register", userData, false);
  },

  async login(email: string, password: string) {
    return apiService.post("/auth/login", { email, password }, false);
  },

  async verifyToken() {
    return apiService.get("/auth/verify-token");
  },
};

export default authService;
