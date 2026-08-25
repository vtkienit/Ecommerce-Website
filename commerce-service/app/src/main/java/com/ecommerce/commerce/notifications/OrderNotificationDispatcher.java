package com.ecommerce.commerce.notifications;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class OrderNotificationDispatcher {

    private final NotificationWebSocketHandler webSocketHandler;

    public OrderNotificationDispatcher(NotificationWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void dispatch(OrderNotification notification) {
        if (notification.getType() == OrderNotificationType.NEW_ORDER) {
            webSocketHandler.sendToAdmins(notification);
            return;
        }
        webSocketHandler.sendToUser(notification.getUserId(), notification);
    }
}
