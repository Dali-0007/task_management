import apiClient from "../../../services/apiClient";

const taskService = {
  async getTasks(params = {}) {
    const response = await apiClient.get("/tasks", { params });
    return response.data;
  },

  async getTask(taskId) {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data.task;
  },

  async createTask(taskData) {
    const response = await apiClient.post("/tasks", taskData);
    return response.data.task;
  },

  async updateTask(taskId, changes) {
    const response = await apiClient.patch(`/tasks/${taskId}`, changes);
    return response.data.task;
  },

  async deleteTask(taskId) {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  async getComments(taskId) {
    const response = await apiClient.get(`/tasks/${taskId}/comments`);
    return response.data.comments;
  },

  async addComment(taskId, content) {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, {
      content,
    });
    return response.data.comment;
  },

  async getSummary() {
    const response = await apiClient.get("/tasks/summary");
    return response.data.summary;
  },
};

export default taskService;
