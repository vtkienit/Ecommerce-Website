package com.ecommerce.catalog.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class ProductDetailResponse {

    private Long id;
    private String slug;
    private String name;
    private String brand;
    private String description;
    private String categorySlug;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;
    private List<ProductSummaryResponse> relatedProducts;
}
