package com.ecommerce.commerce.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CatalogVariantSnapshot {

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
