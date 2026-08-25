package com.ecommerce.app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserAddressUpdateRequest {

    @NotBlank(message = "Address detail is required")
    @Size(max = 255, message = "Address detail must not exceed 255 characters")
    private String addressLine;

    @NotNull(message = "Province or city is required")
    @Positive(message = "Province or city is invalid")
    private Integer provinceCode;

    @NotBlank(message = "Province or city is required")
    @Size(max = 100, message = "Province or city name must not exceed 100 characters")
    private String provinceName;

    @NotNull(message = "Ward or commune is required")
    @Positive(message = "Ward or commune is invalid")
    private Integer wardCode;

    @NotBlank(message = "Ward or commune is required")
    @Size(max = 100, message = "Ward or commune name must not exceed 100 characters")
    private String wardName;
}
