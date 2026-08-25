package com.ecommerce.commerce.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class VoucherCodeRequest {

    @NotBlank
    @Size(max = 30)
    private String code;
}
