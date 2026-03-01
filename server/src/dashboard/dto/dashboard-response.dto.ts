export class MonthlyStatDto {
  month: string;
  count: number;
}

export class EmotionStatDto {
  emotion: string;
  count: number;
}

export class DashboardResponseDto {
  totalCount: number;
  doneCount: number;
  readingCount: number;
  completionRate: number;
  monthlyStats: MonthlyStatDto[];
  emotionStats: EmotionStatDto[];
}
