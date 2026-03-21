export class AITagResponseDto {
  aiComment!: string;
  aiTags!: string[];
}

export class AITasteRecommendResponseDto {
  tasteSummary: string;
  familiarBooks: {
    title: string;
    author: string;
    reason: string;
  }[];
  challengeBooks: {
    title: string;
    author: string;
    reason: string;
  }[];
}

export class AIBookReportDto {
  reportTitle: string;

  /* 주요 독서 의도*/
  topIntent: {
    label: string;
    count: number;
    insight: string;
  };

  /* 의도 vs 감정 분석*/
  intentVsEmotionAnalysis: {
    summary: string;
    details: string[];
  };

  /* 이달의 독서 캐릭터 */
  character: {
    name: string;
    traits: string[];
    description: string;
    reason: string;
  };

  /* 이번 달 기준 데이터 */
  statistics: {
    totalBooks: number;
    mostFrequentEmotion: string;
    changeSummary: string;
  };

  /* AI의 한마디 */
  coachMessage: string;
}
