import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookshelfApi } from "./api";
import { bookshelfKeys } from "./keys";
import { BookshelfItem, UpdateBookshelfRequest } from "./type";

export const useMyBooks = () => {
  return useQuery<BookshelfItem[]>({
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
