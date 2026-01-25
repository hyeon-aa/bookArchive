import { apiFetch } from "@/lib/api";

export const exploreApi = {
  recommendByEmotion: (currentMood: string, userTalk: string) => {
    return apiFetch("/ai-recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ currentMood, userTalk }),
    });
  },
  getDailyQuote: () => {
    return apiFetch("/ai-recommend/daily-quote", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },
  getTasteRecommendations: () => {
    return apiFetch("/ai-recommend/taste", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },
};
