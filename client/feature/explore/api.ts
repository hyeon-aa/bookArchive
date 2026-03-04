import { api } from "@/lib/api";

export const exploreApi = {
  recommendByEmotion: (currentMood: string, userTalk: string) => {
    return api.post("/ai-recommend", {
      currentMood,
      userTalk,
    });
  },

  getDailyQuote: () => {
    return api.get("/ai-recommend/daily-quote");
  },

  getTasteRecommendations: () => {
    return api.get("/ai-recommend/taste");
  },
};
