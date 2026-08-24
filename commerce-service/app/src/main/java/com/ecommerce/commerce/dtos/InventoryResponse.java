package com.ecommerce.commerce.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InventoryResponse {

    private Long id;
    private Long variantId;
    private String productSlug;
    private String productName;
    private String imageUrl;
    private String sku;
    private String size;
    private String thickness;
    private String color;
    private Integer onHandQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
}
