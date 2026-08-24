package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.OrderStatus;
import com.ecommerce.commerce.entities.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long userId;
    private String recipientName;
    private String recipientPhone;
    private String shippingAddress;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private String checkoutUrl;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
