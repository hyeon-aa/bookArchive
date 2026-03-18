import { paymentApi } from "@/feature/payment/api";
import {
  loadTossPayments,
  TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

export function useTossPayments(userId: string | undefined) {
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    orderId: "",
    orderName: "",
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function init() {
      try {
        //서버에서 결제정보 받아올 때지 기다렸다가 데이터 오면 readyData에 담기
        const readyData = await paymentApi.ready();
        const tossPayments = await loadTossPayments(
          process.env.NEXT_PUBLIC_TOSS_WIDGET_KEY!
        );
        const paymentWidgets = tossPayments.widgets({
          customerKey: `USER_${userId}`,
        });

        setPaymentData({
          amount: readyData.amount,
          orderId: readyData.orderId,
          orderName: readyData.orderName,
        });
        setWidgets(paymentWidgets);
      } catch (error) {
        console.error("결제 초기화 실패:", error);
      }
    }

    init();
  }, [userId]);

  useEffect(() => {
    if (!widgets) return;

    const render = async () => {
      await widgets.setAmount({
        currency: "KRW",
        value: paymentData.amount,
      });

      //이용약관과 결제창을 동시에 그린다
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method" }),
        widgets.renderAgreement({ selector: "#agreement" }),
      ]);

      setIsReady(true);
    };

    render();
  }, [widgets, paymentData.amount]);

  const requestPayment = async () => {
    if (!widgets) return;

    await widgets.requestPayment({
      orderId: paymentData.orderId,
      orderName: paymentData.orderName,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
    });
  };

  return {
    amount: paymentData.amount,
    isReady,
    requestPayment,
  };
}
