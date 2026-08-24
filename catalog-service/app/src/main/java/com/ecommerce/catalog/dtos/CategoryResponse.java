package com.ecommerce.catalog.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String slug;
    private String name;
    private long productCount;
}
