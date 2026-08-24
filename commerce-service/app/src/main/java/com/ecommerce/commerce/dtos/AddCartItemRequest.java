package com.ecommerce.commerce.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AddCartItemRequest {

    @NotNull
    @Positive
    private Long variantId;

    @NotNull
    @Positive
    private Integer quantity;
}
