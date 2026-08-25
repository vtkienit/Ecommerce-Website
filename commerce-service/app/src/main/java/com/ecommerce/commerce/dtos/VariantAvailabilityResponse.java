package com.ecommerce.commerce.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VariantAvailabilityResponse {

    private Long variantId;
    private Integer availableQuantity;
}
