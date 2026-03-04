import { api } from "@/lib/api";
import {
  ConfirmPaymentDto,
  PaymentRecord,
  ReadyPaymentDto,
  TossConfirmResponse,
} from "./type";

export const paymentApi = {
  ready: (dto: ReadyPaymentDto): Promise<PaymentRecord> => {
    return api.post("/payments/ready", dto);
  },

  confirm: (dto: ConfirmPaymentDto): Promise<TossConfirmResponse> => {
    return api.post("/payments/confirm", dto);
  },
};
