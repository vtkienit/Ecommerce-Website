package com.ecommerce.commerce.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateReturnRequest {

    @NotBlank
    @Size(min = 10, max = 1000)
    private String reason;
}
