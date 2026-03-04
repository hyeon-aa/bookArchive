import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";
import { dashboardKeys } from "./keys";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardApi.getStats,
  });
};
