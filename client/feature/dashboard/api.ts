import { apiFetch } from "@/lib/api";
import { DashboardData } from "./type";

export const dashboardApi = {
  getStats: async (): Promise<DashboardData> => {
    return await apiFetch("/dashboard", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },
};
