package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.PaymentStatus;
import com.ecommerce.commerce.entities.ReturnRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ReturnRequestResponse {

    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private String reason;
    private ReturnRequestStatus status;
    private String adminNote;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime completedAt;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private List<OrderItemResponse> items;
}
