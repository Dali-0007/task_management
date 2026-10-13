import apiClient from "../../../services/apiClient";

const projectMemberService = {
  async getMembers(projectId) {
    const response = await apiClient.get(
      `/project-membership/${projectId}/members`
    );
    return response.data.members;
  },

  async searchAvailableUsers(projectId, search) {
    const response = await apiClient.get(
      `/project-membership/${projectId}/available-users`,
      { params: { search } }
    );
    return response.data.users;
  },

  async addMember(projectId, userId) {
    const response = await apiClient.post(
      `/project-membership/${projectId}/members`,
      { userId }
    );
    return response.data.member;
  },

  async removeMember(projectId, userId) {
    const response = await apiClient.delete(
      `/project-membership/${projectId}/members/${userId}`
    );
    return response.data;
  },
};

export default projectMemberService;