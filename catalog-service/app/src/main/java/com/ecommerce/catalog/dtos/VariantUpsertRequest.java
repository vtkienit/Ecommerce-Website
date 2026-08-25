package com.ecommerce.catalog.dtos;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class VariantUpsertRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 100, message = "SKU must not exceed 100 characters")
    private String sku;

    @Size(max = 100, message = "Size must not exceed 100 characters")
    private String size;

    @Size(max = 100, message = "Thickness must not exceed 100 characters")
    private String thickness;

    @Size(max = 100, message = "Color must not exceed 100 characters")
    private String color;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "50000", message = "Price must be at least 50000")
    @DecimalMax(value = "500000", message = "Price must not exceed 500000")
    private BigDecimal price;
}
