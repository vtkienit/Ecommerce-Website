package com.ecommerce.commerce.dtos;

import com.ecommerce.commerce.entities.ReturnRequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateReturnStatusRequest {

    @NotNull
    private ReturnRequestStatus status;

    @Size(max = 1000)
    private String adminNote;
}
