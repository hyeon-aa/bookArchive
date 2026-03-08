import { useMutation } from "@tanstack/react-query";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { paymentApi } from "./api";
import { ConfirmPaymentRequest } from "./type";

export const usePaymentMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const readyData = await paymentApi.ready();

      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      return tossPayments.requestPayment("카드", {
        amount: readyData.amount,
        orderId: readyData.orderId,
        orderName: readyData.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    },
  });
};

export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: (dto: ConfirmPaymentRequest) => paymentApi.confirm(dto),
  });
};
