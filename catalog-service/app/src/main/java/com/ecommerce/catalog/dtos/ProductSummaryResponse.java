package com.ecommerce.catalog.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ProductSummaryResponse {

    private Long id;
    private String slug;
    private String name;
    private String brand;
    private String categorySlug;
    private String categoryName;
    private String imageUrl;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private int numberSizes;
    private int numberColors;
}
