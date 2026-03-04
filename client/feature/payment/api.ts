import { api } from "@/lib/api";
import { ConfirmPaymentDto, PaymentRecord, TossConfirmResponse } from "./type";

export const paymentApi = {
  ready: (): Promise<PaymentRecord> => {
    return api.post("/payments/ready");
  },

  confirm: (dto: ConfirmPaymentDto): Promise<TossConfirmResponse> => {
    return api.post("/payments/confirm", dto);
  },
};
