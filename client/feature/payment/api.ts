import { api } from "@/lib/api";
import {
  ConfirmPaymentRequest,
  PaymentResponse,
  TossConfirmResponse,
} from "./type";

export const paymentApi = {
  ready: async () => {
    const data = await api.post<PaymentResponse>("/payments/ready");
    return data;
  },

  confirm: async (dto: ConfirmPaymentRequest) => {
    const data = await api.post<TossConfirmResponse>("/payments/confirm", dto);
    return data;
  },
};
