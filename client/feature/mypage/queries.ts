import { useQuery } from "@tanstack/react-query";
import { getMyPhrases, getMyTags } from "./api";
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
