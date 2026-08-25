package com.ecommerce.commerce.services;

import com.ecommerce.commerce.dtos.AdminDashboardResponse;
import com.ecommerce.commerce.dtos.DashboardLowStockResponse;
import com.ecommerce.commerce.dtos.DashboardOrderResponse;
import com.ecommerce.commerce.entities.Inventory;
import com.ecommerce.commerce.entities.OrderStatus;
import com.ecommerce.commerce.repositories.InventoryRepository;
import com.ecommerce.commerce.repositories.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private static final int LIST_LIMIT = 5;

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final int lowStockThreshold;

    public AdminDashboardService(
            OrderRepository orderRepository,
            InventoryRepository inventoryRepository,
            @Value("${commerce.inventory.low-stock-threshold:5}") int lowStockThreshold
    ) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.lowStockThreshold = lowStockThreshold;
    }

    public AdminDashboardResponse getDashboard() {
        Map<OrderStatus, Long> ordersByStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, 0L);
        }
        orderRepository.countOrdersByStatus().forEach(count ->
                ordersByStatus.put(count.getStatus(), count.getTotal())
        );

        var recentOrders = orderRepository
                .findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(order -> new DashboardOrderResponse(
                        order.getId(),
                        order.getOrderNumber(),
                        order.getRecipientName(),
                        order.getTotalAmount(),
                        order.getStatus(),
                        order.getCreatedAt()
                ))
                .toList();

        var lowStockItems = inventoryRepository
                .findLowStock(lowStockThreshold, PageRequest.of(0, LIST_LIMIT))
                .stream()
                .map(this::toLowStockResponse)
                .toList();

        return new AdminDashboardResponse(
                orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED),
                orderRepository.sumTotalAmountByStatusSince(
                        OrderStatus.DELIVERED,
                        LocalDate.now().withDayOfMonth(1).atStartOfDay()
                ),
                orderRepository.count(),
                orderRepository.countByStatus(OrderStatus.PENDING),
                inventoryRepository.countLowStock(lowStockThreshold),
                ordersByStatus,
                recentOrders,
                lowStockItems
        );
    }

    private DashboardLowStockResponse toLowStockResponse(Inventory inventory) {
        return new DashboardLowStockResponse(
                inventory.getVariantId(),
                inventory.getSku(),
                inventory.getOnHandQuantity(),
                inventory.getReservedQuantity(),
                inventory.getOnHandQuantity() - inventory.getReservedQuantity()
        );
    }
}
