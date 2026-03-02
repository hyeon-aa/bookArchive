import { apiFetch } from "@/lib/api";
import {
  ConfirmPaymentDto,
  PaymentRecord,
  ReadyPaymentDto,
  TossConfirmResponse,
} from "./type";

export const paymentApi = {
  ready: async (dto: ReadyPaymentDto): Promise<PaymentRecord> => {
    return await apiFetch("/payments/ready", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(dto),
    });
  },

  confirm: async (dto: ConfirmPaymentDto): Promise<TossConfirmResponse> => {
    return await apiFetch("/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(dto),
    });
  },
};
