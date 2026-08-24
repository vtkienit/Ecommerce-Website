package com.ecommerce.catalog.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CatalogVariantResponse {

    private Long id;
    private String productSlug;
    private String productName;
    private String imageUrl;
    private String sku;
    private String size;
    private String thickness;
    private String color;
    private BigDecimal originalPrice;
    private BigDecimal price;
    private Integer discountPercentage;
}
