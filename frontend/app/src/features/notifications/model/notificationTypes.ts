export type OrderNotificationType = "NEW_ORDER" | "ORDER_CONFIRMED";

export type OrderNotification = {
  type: OrderNotificationType;
  orderId: number;
  orderNumber: string;
  userId: number;
  recipientName: string;
  createdAt: string;
};

export type ToastNotification = OrderNotification & {
  id: string;
};
