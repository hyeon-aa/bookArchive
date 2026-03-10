import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exploreKeys } from "../explore/keys";
import { bookshelfApi } from "./api";
import { bookshelfKeys } from "./keys";
import { BookshelfItemResponse, UpdateBookshelfRequest } from "./type";

export const useMyBooks = () => {
  return useQuery<BookshelfItemResponse[]>({
    queryKey: bookshelfKeys.lists(),
    queryFn: bookshelfApi.getMyBooks,
  });
};

export const useBookshelfItem = (id: number) => {
  return useQuery({
    queryKey: bookshelfKeys.detail(id),
    queryFn: () => bookshelfApi.getBookshelfItem(id),
    enabled: !!id,
  });
};

export const useAddBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookshelfApi.addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookshelfKeys.lists() });
    },
  });
};

export const useUpdateBook = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBookshelfRequest) =>
      bookshelfApi.updateBookshelfItem(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookshelfKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookshelfKeys.lists() });
    },
  });
};

export const useDeleteBooks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookshelfIds: number[]) =>
      bookshelfApi.deleteBooks(bookshelfIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookshelfKeys.all });
      queryClient.invalidateQueries({ queryKey: exploreKeys.taste() });
    },
  });
};
