package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.OrderResponse;
import com.ecommerce.commerce.dtos.UpdateOrderStatusRequest;
import com.ecommerce.commerce.entities.OrderStatus;
import com.ecommerce.commerce.services.OrderAdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class OrderAdminController {

    private final OrderAdminService orderAdminService;

    public OrderAdminController(OrderAdminService orderAdminService) {
        this.orderAdminService = orderAdminService;
    }

    @GetMapping
    public List<OrderResponse> getOrders(@RequestParam(required = false) OrderStatus status) {
        return orderAdminService.getOrders(status);
    }

    @PatchMapping("/{orderId}/status")
    public OrderResponse updateStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderAdminService.updateStatus(orderId, request.getStatus());
    }
}
