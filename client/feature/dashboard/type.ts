export interface MonthlyStat {
  month: string;
  count: number;
}

export interface EmotionStat {
  emotion: string;
  count: number;
}

export interface DashboardData {
  totalCount: number;
  doneCount: number;
  readingCount: number;
  completionRate: number;
  monthlyStats: MonthlyStat[];
  emotionStats: EmotionStat[];
}
