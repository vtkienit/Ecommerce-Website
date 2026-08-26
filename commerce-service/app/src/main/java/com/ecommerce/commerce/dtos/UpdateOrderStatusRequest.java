package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    @Size(max = 100, message = "Shipping carrier must not exceed 100 characters")
    private String shippingCarrier;
}
