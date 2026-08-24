package com.ecommerce.commerce.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateInventoryRequest {

    @NotNull
    @PositiveOrZero
    private Integer onHandQuantity;
}
