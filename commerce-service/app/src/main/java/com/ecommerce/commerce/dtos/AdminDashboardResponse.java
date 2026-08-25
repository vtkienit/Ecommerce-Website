package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AdminDashboardResponse {

    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long lowStockVariants;
    private Map<OrderStatus, Long> ordersByStatus;
    private List<DashboardOrderResponse> recentOrders;
    private List<DashboardLowStockResponse> lowStockItems;
}
