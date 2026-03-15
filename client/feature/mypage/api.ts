import { api } from "@/lib/api";
import { MyPhrase, MyTags } from "./type";

export const getMyPhrases = async (): Promise<MyPhrase[]> => {
  const data = await api.get<MyPhrase[]>("/mypage/phrases");
  return data;
};

export const getMyTags = async (): Promise<MyTags> => {
  const data = await api.get<MyTags>("/mypage/tags");
  return data;
};
