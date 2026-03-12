import axios, { AxiosError, AxiosResponse } from "axios";
import { getCookie } from "cookies-next";
import { BaseResponse } from "./response";

const API_URL = "http://localhost:4000";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getCookie("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse<BaseResponse<T>>): T => {
    const { data } = response.data;
    return data;
  },
  (error: AxiosError<{ message?: string }>) => {
    const errorMessage =
      error.response?.data?.message || "문제가 발생했습니다.";
    return Promise.reject(new Error(errorMessage));
  }
);

export const api = {
  get: <T>(url: string, config?: object) =>
    axiosInstance.get<T, T>(url, config),
  post: <T>(url: string, body?: unknown) => axiosInstance.post<T, T>(url, body),
  patch: <T>(url: string, body?: unknown) =>
    axiosInstance.patch<T, T>(url, body),
  delete: <T>(url: string, body?: unknown) =>
    axiosInstance.delete<T, T>(url, { data: body }),
};
