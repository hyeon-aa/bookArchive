export interface MonthlyStat {
  month: string;
  count: number;
}

export interface EmotionStat {
  emotion: string;
  count: number;
}

export interface DashboardResponse {
  totalCount: number;
  doneCount: number;
  readingCount: number;
  completionRate: number;
  monthlyStats: MonthlyStat[];
  emotionStats: EmotionStat[];
}
