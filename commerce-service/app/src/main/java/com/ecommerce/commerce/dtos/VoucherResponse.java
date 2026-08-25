package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class VoucherResponse {

    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer quantity;
    private Integer usedCount;
    private Integer remainingQuantity;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
}
