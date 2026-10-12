import apiClient from "../../../services/apiClient";

const projectService = {
  async getProjects() {
    const response = await apiClient.get("/projects");
    return response.data.projects;
  },

  async getProjectById(projectId) {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data.project;
  },

  async createProject(projectData) {
    const response = await apiClient.post("/projects", projectData);
    return response.data.project;
  },

  async updateProject(projectId, projectData) {
    const response = await apiClient.put(
      `/projects/${projectId}`,
      projectData
    );
    return response.data.project;
  },

  async archiveProject(projectId) {
    const response = await apiClient.patch(
      `/projects/${projectId}/archive`
    );
    return response.data.project;
  },
};

export default projectService;