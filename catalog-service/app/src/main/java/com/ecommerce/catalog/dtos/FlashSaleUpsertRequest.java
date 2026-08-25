package com.ecommerce.catalog.dtos;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class FlashSaleUpsertRequest {

    @NotBlank(message = "Flash sale name is required")
    @Size(max = 120, message = "Flash sale name must not exceed 120 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @NotNull(message = "Discount percentage is required")
    @DecimalMin(value = "1", message = "Discount percentage must be at least 1")
    @DecimalMax(value = "90", message = "Discount percentage must not exceed 90")
    private BigDecimal discountPercentage;

    @NotEmpty(message = "Select at least one product")
    private List<@NotNull Long> productIds = new ArrayList<>();
}
