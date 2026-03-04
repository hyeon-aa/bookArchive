export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  detail: (orderId: string) => [...paymentKeys.all, "detail", orderId] as const,
};
