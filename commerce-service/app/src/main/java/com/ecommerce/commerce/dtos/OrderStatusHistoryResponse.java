package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class OrderStatusHistoryResponse {

    private OrderStatus status;
    private LocalDateTime changedAt;
}
