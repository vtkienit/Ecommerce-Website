package com.ecommerce.commerce.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CartItemResponse {

    private Long id;
    private Long variantId;
    private String productSlug;
    private String productName;
    private String imageUrl;
    private String sku;
    private String size;
    private String thickness;
    private String color;
    private Integer quantity;
    private BigDecimal originalPrice;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
