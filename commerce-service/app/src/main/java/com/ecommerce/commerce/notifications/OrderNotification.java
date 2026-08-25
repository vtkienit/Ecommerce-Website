package com.ecommerce.commerce.notifications;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class OrderNotification {

    private OrderNotificationType type;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private String recipientName;
    private LocalDateTime createdAt;
}
