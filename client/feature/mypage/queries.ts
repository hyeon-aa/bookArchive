import { useQuery } from "@tanstack/react-query";
import { getBookTimeLine, getMyPhrases, getMyTags } from "./api";
import { myPageKeys } from "./keys";

export const useGetMyPhrases = () => {
  return useQuery({
    queryKey: myPageKeys.phrases(),
    queryFn: getMyPhrases,
  });
};

export const useGetMyTags = () => {
  return useQuery({
    queryKey: myPageKeys.tags(),
    queryFn: getMyTags,
  });
};

export const useGetBookTimeLine = () => {
  return useQuery({
    queryKey: myPageKeys.timeline(),
    queryFn: getBookTimeLine,
  });
};
