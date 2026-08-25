package com.ecommerce.catalog.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ProductSuggestionResponse {

    private Long id;
    private String slug;
    private String name;
    private String brand;
    private String categoryName;
    private String imageUrl;
    private BigDecimal price;
}
