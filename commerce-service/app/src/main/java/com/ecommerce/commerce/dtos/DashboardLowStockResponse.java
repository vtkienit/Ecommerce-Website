package com.ecommerce.commerce.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardLowStockResponse {

    private Long variantId;
    private String sku;
    private Integer onHandQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
}
