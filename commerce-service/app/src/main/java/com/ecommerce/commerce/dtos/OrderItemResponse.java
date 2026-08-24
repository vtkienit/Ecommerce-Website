package com.ecommerce.commerce.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;
    private Long variantId;
    private String sku;
    private String productName;
    private Integer quantity;
    private BigDecimal originalPrice;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
