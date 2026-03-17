import { api } from "@/lib/api";
import { BookTimelineResponse, MyPhraseResponse, MyTagsResponse } from "./type";

export const getMyPhrases = async (): Promise<MyPhraseResponse[]> => {
  const data = await api.get<MyPhraseResponse[]>("/mypage/phrases");
  return data;
};

export const getMyTags = async (): Promise<MyTagsResponse> => {
  const data = await api.get<MyTagsResponse>("/mypage/tags");
  return data;
};

export const getBookTimeLine = async (): Promise<BookTimelineResponse[]> => {
  const data = await api.get<BookTimelineResponse[]>("/mypage/timeline");
  return data;
};
