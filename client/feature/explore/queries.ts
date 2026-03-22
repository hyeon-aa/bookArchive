import { useMutation, useQuery } from "@tanstack/react-query";
import { exploreApi } from "./api";
import { exploreKeys } from "./keys";

export const useDailyQuote = () => {
  return useQuery({
    queryKey: exploreKeys.quote(),
    queryFn: exploreApi.getDailyQuote,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useTasteRecommendations = () => {
  return useQuery({
    queryKey: exploreKeys.taste(),
    queryFn: exploreApi.getTasteRecommendations,
  });
};

export const useRecommendByEmotion = () => {
  return useMutation({
    mutationFn: ({ mood, talk }: { mood: string; talk: string }) =>
      exploreApi.recommendByEmotion(mood, talk),
  });
};

export const useAIReport = () => {
  return useQuery({
    queryKey: exploreKeys.aireport(),
    queryFn: exploreApi.getReport,
    staleTime: 1000 * 60 * 60,
  });
};
