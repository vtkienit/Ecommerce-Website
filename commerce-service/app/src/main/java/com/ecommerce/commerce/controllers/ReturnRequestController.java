package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.CreateReturnRequest;
import com.ecommerce.commerce.dtos.ReturnRequestResponse;
import com.ecommerce.commerce.services.ReturnRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    public ReturnRequestController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }

    @PostMapping("/{orderId}/returns")
    @ResponseStatus(HttpStatus.CREATED)
    public ReturnRequestResponse create(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId,
            @Valid @RequestBody CreateReturnRequest request
    ) {
        return returnRequestService.create(userId, orderId, request);
    }
}
