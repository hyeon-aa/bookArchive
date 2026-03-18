import { api } from "@/lib/api";
import {
  CancelPaymentRequest,
  ConfirmPaymentRequest,
  myPaymentsResponse,
  PaymentResponse,
  TossCancelResponse,
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

  cancel: async (dto: CancelPaymentRequest) => {
    const data = await api.post<TossCancelResponse>("payments/cancel", dto);
    return data;
  },

  getMyPayments: async () => {
    const data = await api.get<myPaymentsResponse[]>("payments/me");
    return data;
  },
};
