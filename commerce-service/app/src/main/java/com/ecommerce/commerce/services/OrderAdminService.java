package com.ecommerce.commerce.services;

import com.ecommerce.commerce.dtos.OrderResponse;
import com.ecommerce.commerce.dtos.PageResponse;
import com.ecommerce.commerce.dtos.UpdateOrderStatusRequest;
import com.ecommerce.commerce.entities.Order;
import com.ecommerce.commerce.entities.OrderStatus;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.notifications.OrderNotification;
import com.ecommerce.commerce.notifications.OrderNotificationType;
import com.ecommerce.commerce.repositories.OrderRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class OrderAdminService {

    private static final String TRACKING_CODE_PATTERN = "[A-Za-z0-9]{8}";
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = createTransitions();

    private final OrderRepository orderRepository;
    private final OrderLifecycleService lifecycleService;
    private final OrderService orderService;
    private final ApplicationEventPublisher eventPublisher;

    public OrderAdminService(
            OrderRepository orderRepository,
            OrderLifecycleService lifecycleService,
            OrderService orderService,
            ApplicationEventPublisher eventPublisher
    ) {
        this.orderRepository = orderRepository;
        this.lifecycleService = lifecycleService;
        this.orderService = orderService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(
            OrderStatus status,
            String search,
            int page,
            int size
    ) {
        Specification<Order> specification = (root, query, builder) -> {
            ArrayList<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("orderNumber")), keyword),
                        builder.like(builder.lower(root.get("recipientName")), keyword),
                        builder.like(builder.lower(root.get("recipientPhone")), keyword)
                ));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        Page<Order> orders = orderRepository.findAll(
                specification,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return new PageResponse<>(
                orders.getContent().stream().map(orderService::toResponse).toList(),
                orders.getNumber(),
                orders.getSize(),
                orders.getTotalElements(),
                orders.getTotalPages(),
                orders.isFirst(),
                orders.isLast()
        );
    }

    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository
                .findByIdForUpdate(orderId)
                .orElseThrow(() -> new CommerceException("Order not found", HttpStatus.NOT_FOUND));
        OrderStatus nextStatus = request.getStatus();

        if (!ALLOWED_TRANSITIONS.getOrDefault(order.getStatus(), Set.of()).contains(nextStatus)) {
            throw new CommerceException(
                    "Order cannot move from " + order.getStatus() + " to " + nextStatus,
                    HttpStatus.CONFLICT
            );
        }

        if (nextStatus == OrderStatus.SHIPPED) {
            addShippingDetails(order, request);
        }
        applyLifecycleChange(order, nextStatus);
        order.setStatus(nextStatus);
        LocalDateTime changedAt = LocalDateTime.now();
        order.addStatusHistory(nextStatus, changedAt);
        Order savedOrder = saveOrder(order, nextStatus);
        if (nextStatus == OrderStatus.CONFIRMED) {
            eventPublisher.publishEvent(new OrderNotification(
                    OrderNotificationType.ORDER_CONFIRMED,
                    savedOrder.getId(),
                    savedOrder.getOrderNumber(),
                    savedOrder.getUserId(),
                    savedOrder.getRecipientName(),
                    changedAt
            ));
        }
        return orderService.toResponse(savedOrder);
    }

    private void addShippingDetails(Order order, UpdateOrderStatusRequest request) {
        if (request.getShippingCarrier() == null || request.getShippingCarrier().isBlank()
                || request.getTrackingCode() == null || request.getTrackingCode().isBlank()) {
            throw new CommerceException(
                    "Shipping carrier and tracking code are required",
                    HttpStatus.BAD_REQUEST
            );
        }
        String trackingCode = request.getTrackingCode().trim();
        if (!trackingCode.matches(TRACKING_CODE_PATTERN)) {
            throw new CommerceException(
                    "Tracking code must contain exactly 8 letters or numbers",
                    HttpStatus.BAD_REQUEST
            );
        }
        String normalizedTrackingCode = trackingCode.toUpperCase(Locale.ROOT);
        if (orderRepository.existsByTrackingCodeIgnoreCase(normalizedTrackingCode)) {
            throw new CommerceException("Tracking code already exists", HttpStatus.CONFLICT);
        }
        order.setShippingCarrier(request.getShippingCarrier().trim());
        order.setTrackingCode(normalizedTrackingCode);
        order.setShippedAt(LocalDateTime.now());
    }

    private Order saveOrder(Order order, OrderStatus nextStatus) {
        try {
            return orderRepository.saveAndFlush(order);
        } catch (DataIntegrityViolationException exception) {
            if (nextStatus == OrderStatus.SHIPPED) {
                throw new CommerceException("Tracking code already exists", HttpStatus.CONFLICT);
            }
            throw exception;
        }
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
