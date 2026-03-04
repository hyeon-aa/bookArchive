import { useMutation } from "@tanstack/react-query";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { paymentApi } from "./api";
import { ConfirmPaymentDto, ReadyPaymentDto } from "./type";

export const usePaymentMutation = () => {
  return useMutation({
    mutationFn: async (dto: ReadyPaymentDto) => {
      const readyData = await paymentApi.ready(dto);

      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      return tossPayments.requestPayment("카드", {
        amount: dto.amount,
        orderId: readyData.orderId,
        orderName: dto.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    },
  });
};

export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: (dto: ConfirmPaymentDto) => paymentApi.confirm(dto),
  });
};
