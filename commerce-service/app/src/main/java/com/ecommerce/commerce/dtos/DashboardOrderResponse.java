package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DashboardOrderResponse {

    private Long id;
    private String orderNumber;
    private String recipientName;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;
}
