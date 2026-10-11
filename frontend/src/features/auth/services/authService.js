
import apiClient from "../../../services/apiClient";

export async function signUpUser(userData) {
  const response = await apiClient.post("/auth/sign-up", userData);
  return response.data;
}

export async function signInUser(credentials) {
  const response = await apiClient.post("/auth/sign-in", credentials);
  return response.data;
}