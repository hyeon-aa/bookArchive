import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../auth/keys";
import { paymentApi } from "./api";
import { paymentKeys } from "./keys";
import { CancelPaymentRequest, ConfirmPaymentRequest } from "./type";

export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: (dto: ConfirmPaymentRequest) => paymentApi.confirm(dto),
  });
};

export const useCancelPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CancelPaymentRequest) => paymentApi.cancel(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authKeys.user(),
      });
    },
  });
};

export const useGetMyPayments = () => {
  return useQuery({
    queryKey: paymentKeys.lists(),
    queryFn: paymentApi.getMyPayments,
  });
};
