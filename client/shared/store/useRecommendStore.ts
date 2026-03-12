import { RecommendBookItemResponse } from "@/feature/explore/type";
import { create } from "zustand";

interface RecommendResult {
  reason: string;
  books: RecommendBookItemResponse[];
}

interface RecommendState {
  result: RecommendResult | null;
  setResult: (result: RecommendResult) => void;
  clearResult: () => void;
}

export const useRecommendStore = create<RecommendState>((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));
