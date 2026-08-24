package com.ecommerce.commerce.services;

import com.ecommerce.commerce.dtos.OrderResponse;
import com.ecommerce.commerce.entities.Order;
import com.ecommerce.commerce.entities.OrderStatus;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class OrderAdminService {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = createTransitions();

    private final OrderRepository orderRepository;
    private final OrderLifecycleService lifecycleService;
    private final OrderService orderService;

    public OrderAdminService(
            OrderRepository orderRepository,
            OrderLifecycleService lifecycleService,
            OrderService orderService
    ) {
        this.orderRepository = orderRepository;
        this.lifecycleService = lifecycleService;
        this.orderService = orderService;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(OrderStatus status) {
        List<Order> orders = status == null
                ? orderRepository.findAllByOrderByCreatedAtDesc()
                : orderRepository.findByStatusOrderByCreatedAtDesc(status);
        return orders.stream().map(orderService::toResponse).toList();
    }

    public OrderResponse updateStatus(Long orderId, OrderStatus nextStatus) {
        Order order = orderRepository
                .findByIdForUpdate(orderId)
                .orElseThrow(() -> new CommerceException("Order not found", HttpStatus.NOT_FOUND));

        if (!ALLOWED_TRANSITIONS.getOrDefault(order.getStatus(), Set.of()).contains(nextStatus)) {
            throw new CommerceException(
                    "Order cannot move from " + order.getStatus() + " to " + nextStatus,
                    HttpStatus.CONFLICT
            );
        }

        applyLifecycleChange(order, nextStatus);
        order.setStatus(nextStatus);
        return orderService.toResponse(orderRepository.save(order));
    }

    private void applyLifecycleChange(Order order, OrderStatus nextStatus) {
        switch (nextStatus) {
            case CONFIRMED -> lifecycleService.confirm(order);
            case CANCELLED -> lifecycleService.cancel(order);
            case SHIPPED -> lifecycleService.ship(order);
            case DELIVERED -> lifecycleService.deliver(order);
            default -> {
            }
        }
    }

    private static Map<OrderStatus, Set<OrderStatus>> createTransitions() {
        Map<OrderStatus, Set<OrderStatus>> transitions = new EnumMap<>(OrderStatus.class);
        transitions.put(OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));
        transitions.put(OrderStatus.CONFIRMED, Set.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED));
        transitions.put(OrderStatus.PROCESSING, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
        transitions.put(OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED));
        return transitions;
    }
}
