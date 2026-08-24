package com.ecommerce.commerce.services;

import com.ecommerce.commerce.clients.CatalogGateway;
import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;
import com.ecommerce.commerce.dtos.CheckoutRequest;
import com.ecommerce.commerce.dtos.OrderItemResponse;
import com.ecommerce.commerce.dtos.OrderResponse;
import com.ecommerce.commerce.entities.*;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.CartRepository;
import com.ecommerce.commerce.repositories.InventoryRepository;
import com.ecommerce.commerce.repositories.OrderRepository;
import com.ecommerce.commerce.repositories.StockReservationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final StockReservationRepository reservationRepository;
    private final CatalogGateway catalogGateway;
    private final OrderLifecycleService orderLifecycleService;
    private final PaymentService paymentService;
    private final int defaultStock;

    public OrderService(
            CartRepository cartRepository,
            OrderRepository orderRepository,
            InventoryRepository inventoryRepository,
            StockReservationRepository reservationRepository,
            CatalogGateway catalogGateway,
            OrderLifecycleService orderLifecycleService,
            PaymentService paymentService,
            @Value("${commerce.inventory.default-stock:10}") int defaultStock
    ) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.reservationRepository = reservationRepository;
        this.catalogGateway = catalogGateway;
        this.orderLifecycleService = orderLifecycleService;
        this.paymentService = paymentService;
        this.defaultStock = defaultStock;
    }

    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        String paymentMethod = request.getPaymentMethod().trim().toUpperCase(Locale.ROOT);
        if (!paymentService.supports(paymentMethod)) {
            throw new CommerceException("Unsupported payment method", HttpStatus.BAD_REQUEST);
        }

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseThrow(() -> new CommerceException("Cart is empty", HttpStatus.BAD_REQUEST));
        if (cart.getItems().isEmpty()) {
            throw new CommerceException("Cart is empty", HttpStatus.BAD_REQUEST);
        }

        Order order = createOrder(userId, request);

        for (CartItem cartItem : cart.getItems()) {
            CatalogVariantSnapshot variant = catalogGateway.getVariant(cartItem.getVariantId());
            Inventory inventory = getInventory(variant);
            int available = inventory.getOnHandQuantity() - inventory.getReservedQuantity();

            if (available < cartItem.getQuantity()) {
                throw new CommerceException(
                        variant.getProductName() + " only has " + available + " item(s) left",
                        HttpStatus.CONFLICT
                );
            }

            inventory.setReservedQuantity(inventory.getReservedQuantity() + cartItem.getQuantity());
            addOrderItem(order, cartItem, variant);
        }

        calculateTotals(order);
        Payment payment = addPayment(order, paymentMethod);
        Order savedOrder = orderRepository.save(order);
        createReservations(savedOrder);
        if (PaymentService.PAYOS.equals(paymentMethod)) {
            paymentService.createOnlinePayment(savedOrder, payment);
        }

        cart.getItems().clear();
        cartRepository.save(cart);
        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Long userId) {
        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, Long orderId) {
        return toResponse(getRequiredOrder(userId, orderId));
    }

    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository
                .findByIdAndUserIdForUpdate(orderId, userId)
                .orElseThrow(() -> new CommerceException("Order not found", HttpStatus.NOT_FOUND));
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return toResponse(order);
        }
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new CommerceException("This order can no longer be cancelled", HttpStatus.CONFLICT);
        }

        orderLifecycleService.cancel(order);
        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse syncPayment(Long userId, Long orderId) {
        Order order = orderRepository
                .findByIdAndUserIdForUpdate(orderId, userId)
                .orElseThrow(() -> new CommerceException("Order not found", HttpStatus.NOT_FOUND));
        paymentService.syncOnlinePayment(order);
        return toResponse(order);
    }

    private Order createOrder(Long userId, CheckoutRequest request) {
        Order order = new Order();
        order.setOrderNumber("QD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        order.setUserId(userId);
        order.setRecipientName(request.getRecipientName().trim());
        order.setRecipientPhone(request.getRecipientPhone().trim());
        order.setShippingAddress(request.getShippingAddress().trim());
        order.setSubtotal(BigDecimal.ZERO);
        order.setVoucherDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        return order;
    }

    private Inventory getInventory(CatalogVariantSnapshot variant) {
        return inventoryRepository
                .findByVariantIdForUpdate(variant.getId())
                .orElseGet(() -> {
                    Inventory inventory = new Inventory();
                    inventory.setVariantId(variant.getId());
                    inventory.setSku(variant.getSku());
                    inventory.setOnHandQuantity(defaultStock);
                    inventory.setReservedQuantity(0);
                    return inventoryRepository.save(inventory);
                });
    }

    private void addOrderItem(
            Order order,
            CartItem cartItem,
            CatalogVariantSnapshot variant
    ) {
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setVariantId(variant.getId());
        item.setSku(variant.getSku());
        item.setProductName(variant.getProductName());
        item.setQuantity(cartItem.getQuantity());
        item.setOriginalPrice(variant.getOriginalPrice());
        item.setUnitPrice(variant.getPrice());
        item.setDiscountAmount(variant.getOriginalPrice().subtract(variant.getPrice()));
        order.getItems().add(item);
    }

    private void calculateTotals(Order order) {
        BigDecimal subtotal = order
                .getItems()
                .stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setSubtotal(subtotal);
        order.setVoucherDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);
    }

    private Payment addPayment(Order order, String paymentMethod) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        order.getPayments().add(payment);
        return payment;
    }

    private void createReservations(Order order) {
        for (OrderItem item : order.getItems()) {
            Inventory inventory = inventoryRepository
                    .findByVariantIdForUpdate(item.getVariantId())
                    .orElseThrow(() -> new CommerceException("Inventory not found", HttpStatus.CONFLICT));
            StockReservation reservation = new StockReservation();
            reservation.setOrder(order);
            reservation.setInventory(inventory);
            reservation.setQuantity(item.getQuantity());
            reservation.setStatus(StockReservationStatus.ACTIVE);
            reservation.setCreatedAt(LocalDateTime.now());
            reservation.setExpiresAt(LocalDateTime.now().plusHours(24));
            reservationRepository.save(reservation);
        }
    }

    private Order getRequiredOrder(Long userId, Long orderId) {
        return orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new CommerceException("Order not found", HttpStatus.NOT_FOUND));
    }

    OrderResponse toResponse(Order order) {
        Payment payment = order.getPayments().stream().findFirst().orElse(null);
        List<OrderItemResponse> items = order
                .getItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getVariantId(),
                        item.getSku(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getOriginalPrice(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getRecipientName(),
                order.getRecipientPhone(),
                order.getShippingAddress(),
                order.getSubtotal(),
                order.getVoucherDiscountAmount(),
                order.getTotalAmount(),
                order.getStatus(),
                payment == null ? null : payment.getPaymentMethod(),
                payment == null ? null : payment.getStatus(),
                payment == null ? null : payment.getCheckoutUrl(),
                order.getCreatedAt(),
                items
        );
    }
}
