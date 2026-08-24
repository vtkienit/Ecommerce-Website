package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.CheckoutRequest;
import com.ecommerce.commerce.dtos.OrderResponse;
import com.ecommerce.commerce.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public OrderResponse checkout(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CheckoutRequest request
    ) {
        return orderService.checkout(userId, request);
    }

    @GetMapping
    public List<OrderResponse> getOrders(@AuthenticationPrincipal Long userId) {
        return orderService.getOrders(userId);
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrder(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId
    ) {
        return orderService.getOrder(userId, orderId);
    }

    @PatchMapping("/{orderId}/cancel")
    public OrderResponse cancelOrder(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId
    ) {
        return orderService.cancelOrder(userId, orderId);
    }

    @PostMapping("/{orderId}/payment/sync")
    public OrderResponse syncPayment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId
    ) {
        return orderService.syncPayment(userId, orderId);
    }
}
