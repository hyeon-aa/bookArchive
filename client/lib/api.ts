import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    const errorMessage =
      error.response?.data?.message || "문제가 발생했습니다.";
    return Promise.reject(new Error(errorMessage));
  }
);
