import { RecommendBookItemResponse } from "@/feature/explore/type";
import { create } from "zustand";

interface RecommendResult {
  reason: string;
  books: RecommendBookItemResponse[];
}

interface RecommendPayload {
  mood: string;
  talk: string;
}

interface RecommendState {
  result: RecommendResult | null;
  payload: RecommendPayload | null;
  setPayload: (payload: RecommendPayload) => void;
  setResult: (result: RecommendResult) => void;
  clearResult: () => void;
}

export const useRecommendStore = create<RecommendState>((set) => ({
  payload: null,
  result: null,

  setPayload: (payload) => set({ payload }),
  setResult: (result) => set({ result }),

  clearResult: () => set({ result: null }),
}));
