package com.ecommerce.commerce.services;

import jakarta.persistence.criteria.Predicate;
import com.ecommerce.commerce.dtos.CreateReturnRequest;
import com.ecommerce.commerce.dtos.OrderItemResponse;
import com.ecommerce.commerce.dtos.PageResponse;
import com.ecommerce.commerce.dtos.ReturnRequestResponse;
import com.ecommerce.commerce.dtos.UpdateReturnStatusRequest;
import com.ecommerce.commerce.entities.Inventory;
import com.ecommerce.commerce.entities.Order;
import com.ecommerce.commerce.entities.OrderItem;
import com.ecommerce.commerce.entities.OrderStatus;
import com.ecommerce.commerce.entities.Payment;
import com.ecommerce.commerce.entities.ReturnRequest;
import com.ecommerce.commerce.entities.ReturnRequestStatus;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.InventoryRepository;
import com.ecommerce.commerce.repositories.OrderRepository;
import com.ecommerce.commerce.repositories.ReturnRequestRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class ReturnRequestService {

    private static final Map<ReturnRequestStatus, Set<ReturnRequestStatus>> ALLOWED_TRANSITIONS =
            createTransitions();

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final PaymentService paymentService;
    private final int returnWindowDays;

    public ReturnRequestService(
            ReturnRequestRepository returnRequestRepository,
            OrderRepository orderRepository,
            InventoryRepository inventoryRepository,
            PaymentService paymentService,
            @Value("${commerce.returns.window-days:7}") int returnWindowDays
    ) {
        this.returnRequestRepository = returnRequestRepository;
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.paymentService = paymentService;
        this.returnWindowDays = returnWindowDays;
    }

    public ReturnRequestResponse create(Long userId, Long orderId, CreateReturnRequest request) {
        Order order = orderRepository
                .findByIdAndUserIdForUpdate(orderId, userId)
                .orElseThrow(() -> new CommerceException("Order not found", HttpStatus.NOT_FOUND));

        if (!isEligible(order)) {
            throw new CommerceException(
                    "Only delivered orders within the return window can be returned",
                    HttpStatus.CONFLICT
            );
        }
        if (returnRequestRepository.existsByOrderId(orderId)) {
            throw new CommerceException("A return request already exists for this order", HttpStatus.CONFLICT);
        }

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setUserId(userId);
        returnRequest.setReason(request.getReason().trim());
        returnRequest.setStatus(ReturnRequestStatus.REQUESTED);
        returnRequest.setRequestedAt(LocalDateTime.now());
        order.setReturnRequest(returnRequest);
        return toResponse(returnRequestRepository.save(returnRequest));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReturnRequestResponse> getAdminRequests(
            ReturnRequestStatus status,
            String search,
            int page,
            int size
    ) {
        Specification<ReturnRequest> specification = (root, query, builder) -> {
            ArrayList<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("reason")), keyword),
                        builder.like(builder.lower(root.get("order").get("orderNumber")), keyword)
                ));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        Page<ReturnRequest> requests = returnRequestRepository.findAll(
                specification,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestedAt"))
        );
        return new PageResponse<>(
                requests.getContent().stream().map(this::toResponse).toList(),
                requests.getNumber(),
                requests.getSize(),
                requests.getTotalElements(),
                requests.getTotalPages(),
                requests.isFirst(),
                requests.isLast()
        );
    }

    public ReturnRequestResponse updateStatus(Long requestId, UpdateReturnStatusRequest request) {
        ReturnRequest returnRequest = returnRequestRepository
                .findByIdForUpdate(requestId)
                .orElseThrow(() -> new CommerceException("Return request not found", HttpStatus.NOT_FOUND));
        ReturnRequestStatus nextStatus = request.getStatus();

        if (returnRequest.getStatus() == nextStatus) {
            return toResponse(returnRequest);
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(returnRequest.getStatus(), Set.of()).contains(nextStatus)) {
            throw new CommerceException(
                    "Return request cannot move from " + returnRequest.getStatus() + " to " + nextStatus,
                    HttpStatus.CONFLICT
            );
        }

        String adminNote = normalize(request.getAdminNote());
        if (nextStatus == ReturnRequestStatus.REJECTED && adminNote == null) {
            throw new CommerceException("A rejection reason is required", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime now = LocalDateTime.now();
        if (nextStatus == ReturnRequestStatus.APPROVED || nextStatus == ReturnRequestStatus.REJECTED) {
            returnRequest.setReviewedAt(now);
        }
        if (nextStatus == ReturnRequestStatus.COMPLETED) {
            completeReturn(returnRequest.getOrder());
            returnRequest.setCompletedAt(now);
        }

        returnRequest.setStatus(nextStatus);
        if (adminNote != null) {
            returnRequest.setAdminNote(adminNote);
        }
        return toResponse(returnRequestRepository.save(returnRequest));
    }

    public boolean isEligible(Order order) {
        if (order.getStatus() != OrderStatus.DELIVERED
                || order.getReturnRequest() != null
                || order.getDeliveredAt() == null) {
            return false;
        }
        return !LocalDateTime.now().isAfter(order.getDeliveredAt().plusDays(returnWindowDays));
    }

    public ReturnRequestResponse toResponse(ReturnRequest returnRequest) {
        Order order = returnRequest.getOrder();
        Payment payment = order.getPayments().stream().findFirst().orElse(null);
        List<OrderItemResponse> items = order
                .getItems()
                .stream()
                .map(this::toItemResponse)
                .toList();

        return new ReturnRequestResponse(
                returnRequest.getId(),
                order.getId(),
                order.getOrderNumber(),
                returnRequest.getUserId(),
                returnRequest.getReason(),
                returnRequest.getStatus(),
                returnRequest.getAdminNote(),
                returnRequest.getRequestedAt(),
                returnRequest.getReviewedAt(),
                returnRequest.getCompletedAt(),
                order.getTotalAmount(),
                payment == null ? null : payment.getPaymentMethod(),
                payment == null ? null : payment.getStatus(),
                items
        );
    }

    private void completeReturn(Order order) {
        for (OrderItem item : order.getItems()) {
            Inventory inventory = inventoryRepository
                    .findByVariantIdForUpdate(item.getVariantId())
                    .orElseThrow(() -> new CommerceException("Inventory not found", HttpStatus.CONFLICT));
            inventory.setOnHandQuantity(inventory.getOnHandQuantity() + item.getQuantity());
        }
        paymentService.markRefundCompleted(order);
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new OrderItemResponse(
                item.getId(),
                item.getVariantId(),
                item.getSku(),
                item.getProductName(),
                item.getQuantity(),
                item.getOriginalPrice(),
                item.getUnitPrice(),
                lineTotal
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static Map<ReturnRequestStatus, Set<ReturnRequestStatus>> createTransitions() {
        Map<ReturnRequestStatus, Set<ReturnRequestStatus>> transitions =
                new EnumMap<>(ReturnRequestStatus.class);
        transitions.put(
                ReturnRequestStatus.REQUESTED,
                Set.of(ReturnRequestStatus.APPROVED, ReturnRequestStatus.REJECTED)
        );
        transitions.put(ReturnRequestStatus.APPROVED, Set.of(ReturnRequestStatus.COMPLETED));
        return transitions;
    }
}
