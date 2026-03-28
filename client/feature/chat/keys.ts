export const chatKeys = {
  all: ["chat"] as const,
  rooms: () => [...chatKeys.all, "rooms"] as const,
  messages: (roomId: number) => [...chatKeys.all, "messages", roomId] as const,
};
