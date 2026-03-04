import { api } from "@/lib/api";
import { DashboardData } from "./type";

export const dashboardApi = {
  getStats: async (): Promise<DashboardData> => {
    return await api("/dashboard");
  },
};
