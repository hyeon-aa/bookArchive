export class AITagResponseDto {
  comment!: string;
  tags!: string[];
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
