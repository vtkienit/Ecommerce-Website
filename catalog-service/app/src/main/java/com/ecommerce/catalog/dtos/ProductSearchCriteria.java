package com.ecommerce.catalog.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class ProductSearchCriteria {

    private String category;
    private String search;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<String> sizes;
    private List<String> colors;
    private String sort;
    private int page;
    private int size;
}
