import axios from "axios";
import API_BASE_URL from "./apiConfig";

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: true,
  timeout: 15000,
});

authApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("shopsphere_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getMyProfile = async () => {
  const response = await authApi.get("/profile");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await authApi.put("/profile", profileData);
  return response.data;
};

export default authApi;
