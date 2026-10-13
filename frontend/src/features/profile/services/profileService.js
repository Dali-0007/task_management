import apiClient from "../../../services/apiClient";

const profileService = {
  async updateProfile({ name }) {
    const response = await apiClient.patch("/auth/me", { name });
    return response.data.user;
  },
};

export default profileService;
