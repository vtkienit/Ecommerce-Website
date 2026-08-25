package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class VoucherRequest {

    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9_-]{3,30}")
    private String code;

    @Size(max = 255)
    private String description;

    @NotNull
    private DiscountType discountType;

    @NotNull
    @DecimalMin(value = "0", inclusive = false)
    private BigDecimal discountValue;

    @NotNull
    @DecimalMin("0")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0", inclusive = false)
    private BigDecimal maxDiscountAmount;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;
}
