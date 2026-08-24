package com.ecommerce.catalog.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductUpsertRequest {

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    @Size(max = 160, message = "Product name must not exceed 160 characters")
    private String name;

    @Size(max = 180, message = "Product slug must not exceed 180 characters")
    private String slug;

    @Size(max = 120, message = "Brand must not exceed 120 characters")
    private String brand;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
}
