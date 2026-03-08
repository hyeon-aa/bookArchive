import { api } from "@/lib/api";
import {
  DailyQuoteResponse,
  RecommendBookItemResponse,
  TasteRecommendResponse,
} from "./type";

export const exploreApi = {
  recommendByEmotion: async (currentMood: string, userTalk: string) => {
    const data = await api.post<RecommendBookItemResponse[]>("/ai-recommend", {
      currentMood,
      userTalk,
    });
    return data;
  },

  getDailyQuote: async () => {
    return await api.get<DailyQuoteResponse>("/ai-recommend/daily-quote");
  },

  getTasteRecommendations: async () => {
    return await api.get<TasteRecommendResponse>("/ai-recommend/taste");
  },
};
