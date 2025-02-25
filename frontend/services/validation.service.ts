import apiService from "./api.service";

const validationService = {
  async checkEmail(email: string) {
    return apiService.post("/validation/check-email", { email }, false);
  },

  async validateProfile(profileData: any) {
    return apiService.post("/validation/validate-profile", profileData, false);
  },

  async validatePhysical(physicalData: any) {
    return apiService.post(
      "/validation/validate-physical",
      physicalData,
      false
    );
  },

  async validateTargetWeight(weightData: any) {
    return apiService.post(
      "/validation/validate-target-weight",
      weightData,
      false
    );
  },

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birthDateObj = new Date(birthDate);

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return age;
  },
};

export default validationService;
