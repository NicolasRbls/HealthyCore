import apiService from "./api.service";

const dataService = {
  async getSedentaryLevels() {
    return apiService.get("/data/sedentary-levels", false);
  },

  async getNutritionalPlans(type?: string) {
    const endpoint = type
      ? `/data/nutritional-plans?type=${type}`
      : "/data/nutritional-plans";
    return apiService.get(endpoint, false);
  },

  async getDiets() {
    return apiService.get("/data/diets", false);
  },

  async getActivities() {
    return apiService.get("/data/activities", false);
  },

  async getWeeklySessions() {
    return apiService.get("/data/weekly-sessions", false);
  },

  async getUserPreferences() {
    return apiService.get("/data/user-preferences");
  },

  async getUserEvolution() {
    return apiService.get("/data/user-evolution");
  },
};

export default dataService;
