import { api } from "@/lib/api";
import { DashboardResponse } from "./type";

export const dashboardApi = {
  getStats: async () => {
    return await api.get<DashboardResponse>("/dashboard");
  },
};
