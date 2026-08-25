package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderStatusCount {

    private OrderStatus status;
    private long total;
}
